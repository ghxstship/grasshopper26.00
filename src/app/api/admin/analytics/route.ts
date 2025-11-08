import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: adminData } = await supabase
      .from('brand_admins')
      .select('brand_id, role')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch analytics data
    const [
      { data: orders, error: ordersError },
      { data: tickets, error: ticketsError },
      { data: events, error: eventsError },
      { data: recentOrders, error: recentOrdersError },
    ] = await Promise.all([
      // Total orders and revenue
      supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', startDate.toISOString()),
      
      // Total tickets sold
      supabase
        .from('tickets')
        .select('id, created_at, status')
        .gte('created_at', startDate.toISOString()),
      
      // Events
      supabase
        .from('events')
        .select('id, name, status, start_date')
        .eq('brand_id', adminData.brand_id),
      
      // Recent orders
      supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          events (name)
        `)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (ordersError || ticketsError || eventsError || recentOrdersError) {
      console.error('Analytics fetch error:', {
        ordersError,
        ticketsError,
        eventsError,
        recentOrdersError,
      });
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const totalRevenue = orders?.reduce(
      (sum, order) => sum + (order.status === 'completed' ? order.total_amount : 0),
      0
    ) || 0;

    const totalOrders = orders?.filter(o => o.status === 'completed').length || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const totalTickets = tickets?.filter(t => t.status === 'active').length || 0;

    // Calculate daily revenue for chart
    const dailyRevenue: Record<string, number> = {};
    orders?.forEach(order => {
      if (order.status === 'completed') {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total_amount;
      }
    });

    const revenueChart = Object.entries(dailyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));

    // Event statistics
    const upcomingEvents = events?.filter(
      e => new Date(e.start_date) > now && e.status === 'upcoming'
    ).length || 0;

    const pastEvents = events?.filter(
      e => new Date(e.start_date) < now
    ).length || 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalTickets,
        upcomingEvents,
        pastEvents,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      charts: {
        revenue: revenueChart,
      },
      recentOrders: recentOrders || [],
      period,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
