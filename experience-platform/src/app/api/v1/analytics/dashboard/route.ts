import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError } from '@/lib/api/error-handler';
import { requireAdmin } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

// GET /api/v1/analytics/dashboard - Get dashboard KPIs
export async function GET(req: NextRequest) {
  try {
    await rateLimit(req, RateLimitPresets.read);
    await requireAdmin(req);

    const supabase = await createClient();

    // Get dashboard KPIs using the database function
    const { data: kpis, error } = await supabase.rpc('get_dashboard_kpis');

    if (error) {
      throw error;
    }

    // Get recent activity
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        events (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get top events
    const { data: topEvents } = await supabase
      .from('event_sales_summary')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(5);

    // Get top artists
    const { data: topArtists } = await supabase.rpc('get_top_artists', {
      result_limit: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        kpis: kpis?.[0] || {},
        recentOrders: recentOrders || [],
        topEvents: topEvents || [],
        topArtists: topArtists || [],
      },
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
