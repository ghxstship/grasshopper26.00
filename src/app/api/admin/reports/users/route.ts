import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

/**
 * GET /api/admin/reports/users
 * Generate user activity and registration report
 */
export async function GET(request: NextRequest) {
  try {
    await rateLimit(request, RateLimitPresets.read);

    const supabase = await createClient();

    // Check authentication and admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['super_admin', 'brand_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const format = searchParams.get('format') || 'json';

    // Get user statistics
    let query = supabase
      .from('profiles')
      .select('id, created_at, role, status, full_name, email');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const totalUsers = users?.length || 0;
    const usersByRole = users?.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const usersByStatus = users?.reduce((acc: Record<string, number>, user) => {
      acc[user.status || 'active'] = (acc[user.status || 'active'] || 0) + 1;
      return acc;
    }, {});

    const summary = {
      total_users: totalUsers,
      users_by_role: usersByRole,
      users_by_status: usersByStatus,
      date_range: {
        start: startDate || 'all',
        end: endDate || 'all',
      },
    };

    // Return JSON format
    if (format === 'json') {
      return NextResponse.json({
        summary,
        users,
      });
    }

    // Return CSV format
    if (format === 'csv') {
      const csvRows = [
        ['User ID', 'Name', 'Email', 'Role', 'Status', 'Registration Date'].join(','),
        ...(users || []).map(u => [
          u.id,
          u.full_name || 'N/A',
          u.email || 'N/A',
          u.role,
          u.status || 'active',
          new Date(u.created_at).toISOString(),
        ].join(',')),
      ];

      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/admin/reports/users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
