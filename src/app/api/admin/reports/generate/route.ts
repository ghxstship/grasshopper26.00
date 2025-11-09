import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportType, startDate, endDate } = await request.json();

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let csvData: string;

    switch (reportType) {
      case 'sales_summary':
        csvData = await generateSalesSummary(supabase, startDate, endDate);
        break;
      case 'event_performance':
        csvData = await generateEventPerformance(supabase, startDate, endDate);
        break;
      case 'customer_analytics':
        csvData = await generateCustomerAnalytics(supabase, startDate, endDate);
        break;
      case 'ticket_sales':
        csvData = await generateTicketSales(supabase, startDate, endDate);
        break;
      case 'revenue_breakdown':
        csvData = await generateRevenueBreakdown(supabase, startDate, endDate);
        break;
      case 'refund_analysis':
        csvData = await generateRefundAnalysis(supabase, startDate, endDate);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${reportType}_${startDate}_to_${endDate}.csv"`,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateSalesSummary(supabase: any, startDate: string, endDate: string): Promise<string> {
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      events (name),
      tickets (id)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  const headers = ['Order ID', 'Date', 'Event', 'Amount', 'Status', 'Tickets', 'Payment Method'];
  const rows = (orders || []).map((order: any) => [
    order.id,
    new Date(order.created_at).toISOString(),
    order.events?.name || 'N/A',
    order.total_amount,
    order.status,
    order.tickets?.length || 0,
    order.payment_method || 'N/A',
  ]);

  return [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
}

async function generateEventPerformance(supabase: any, startDate: string, endDate: string): Promise<string> {
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      tickets (id, status),
      orders (total_amount, status)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const headers = ['Event ID', 'Event Name', 'Date', 'Capacity', 'Tickets Sold', 'Revenue', 'Status'];
  const rows = (events || []).map((event: any) => {
    const soldTickets = event.tickets?.filter((t: any) => t.status === 'active').length || 0;
    const revenue = event.orders
      ?.filter((o: any) => o.status === 'completed')
      .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount), 0) || 0;

    return [
      event.id,
      event.name,
      new Date(event.start_date).toISOString(),
      event.capacity || 'N/A',
      soldTickets,
      revenue.toFixed(2),
      event.status,
    ];
  });

  return [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
}

async function generateCustomerAnalytics(supabase: any, startDate: string, endDate: string): Promise<string> {
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      user_id,
      total_amount,
      created_at,
      user_profiles (email, created_at)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Group by user
  const userMap = new Map();
  (orders || []).forEach((order: any) => {
    const userId = order.user_id;
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        email: order.user_profiles?.email || 'N/A',
        orderCount: 0,
        totalSpent: 0,
        firstOrder: order.created_at,
        isNew: new Date(order.user_profiles?.created_at) >= new Date(startDate),
      });
    }
    const user = userMap.get(userId);
    user.orderCount++;
    user.totalSpent += parseFloat(order.total_amount);
  });

  const headers = ['User Email', 'Order Count', 'Total Spent', 'First Order', 'Customer Type'];
  const rows = Array.from(userMap.values()).map((user: any) => [
    user.email,
    user.orderCount,
    user.totalSpent.toFixed(2),
    new Date(user.firstOrder).toISOString(),
    user.isNew ? 'New' : 'Returning',
  ]);

  return [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
}

async function generateTicketSales(supabase: any, startDate: string, endDate: string): Promise<string> {
  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      ticket_types (name, price),
      events (name)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const headers = ['Ticket ID', 'Event', 'Type', 'Price', 'Status', 'Purchase Date'];
  const rows = (tickets || []).map((ticket: any) => [
    ticket.id,
    ticket.events?.name || 'N/A',
    ticket.ticket_types?.name || 'N/A',
    ticket.ticket_types?.price || 'N/A',
    ticket.status,
    new Date(ticket.created_at).toISOString(),
  ]);

  return [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
}

async function generateRevenueBreakdown(supabase: any, startDate: string, endDate: string): Promise<string> {
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      events (name, event_type)
    `)
    .eq('status', 'completed')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const headers = ['Date', 'Event', 'Event Type', 'Gross Revenue', 'Fees', 'Net Revenue'];
  const rows = (orders || []).map((order: any) => {
    const gross = parseFloat(order.total_amount);
    const fees = gross * 0.029 + 0.30; // Example fee calculation
    const net = gross - fees;

    return [
      new Date(order.created_at).toISOString(),
      order.events?.name || 'N/A',
      order.events?.event_type || 'N/A',
      gross.toFixed(2),
      fees.toFixed(2),
      net.toFixed(2),
    ];
  });

  return [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
}

async function generateRefundAnalysis(supabase: any, startDate: string, endDate: string): Promise<string> {
  const { data: refunds } = await supabase
    .from('refunds')
    .select(`
      *,
      orders (total_amount, events (name))
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const headers = ['Refund ID', 'Order ID', 'Event', 'Amount', 'Reason', 'Status', 'Date'];
  const rows = (refunds || []).map((refund: any) => [
    refund.id,
    refund.order_id,
    refund.orders?.events?.name || 'N/A',
    refund.amount,
    refund.reason || 'N/A',
    refund.status,
    new Date(refund.created_at).toISOString(),
  ]);

  return [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
}
