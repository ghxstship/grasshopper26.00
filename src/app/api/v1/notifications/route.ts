import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

// GET /api/v1/notifications - Get user notifications
export async function GET(req: NextRequest) {
  try {
    await rateLimit(req, RateLimitPresets.read);
    const user = await requireAuth(req);

    const searchParams = req.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = await createClient();

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: notifications || [],
      total: count || 0,
      unreadCount: notifications?.filter(n => !n.read).length || 0,
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// PATCH /api/v1/notifications - Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    const user = await requireAuth(req);

    const { notificationIds, markAllAsRead } = await req.json();

    const supabase = await createClient();

    if (markAllAsRead) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Notifications marked as read',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid request',
    }, { status: 400 });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
