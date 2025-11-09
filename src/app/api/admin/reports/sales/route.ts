import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

/**
 * GET /api/admin/reports/sales
 * Generate sales report with date range filtering
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

    if (!profile || !['super_admin', 'brand_admin', 'event_manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const eventId = searchParams.get('event_id');
    const format = searchParams.get('format') || 'json'; // json or csv

    // Build query for orders
    let query = supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        user_id,
        event_id,
        events (
          name,
          slug
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('status', 'completed');

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching sales data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const summary = {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      average_order_value: averageOrderValue,
      date_range: {
        start: startDate || 'all',
        end: endDate || 'all',
      },
    };

    // Return JSON format
    if (format === 'json') {
      return NextResponse.json({
        summary,
        orders,
      });
    }

    // Return CSV format
    if (format === 'csv') {
      const csvRows = [
        ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Event', 'Amount', 'Status'].join(','),
        ...(orders || []).map(order => [
          order.id,
          new Date(order.created_at).toISOString(),
          (order.profiles as any)?.full_name || 'N/A',
          (order.profiles as any)?.email || 'N/A',
          (order.events as any)?.name || 'N/A',
          order.total_amount,
          order.status,
        ].join(',')),
      ];

      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/admin/reports/sales:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
