/**
 * Admin Analytics System
 * Provides comprehensive analytics for events, sales, and memberships
 */

import { createClient } from '@/lib/supabase/server';

export interface SalesMetrics {
  totalRevenue: number;
  ticketsSold: number;
  averageTicketPrice: number;
  refundedAmount: number;
  netRevenue: number;
}

export interface EventAnalytics {
  eventId: string;
  eventName: string;
  totalTickets: number;
  soldTickets: number;
  scannedTickets: number;
  revenue: number;
  attendanceRate: number;
  salesByType: Array<{
    typeName: string;
    sold: number;
    revenue: number;
  }>;
}

export interface MembershipMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  churnRate: number;
  mrr: number;
  arr: number;
  byTier: Record<string, number>;
}

/**
 * Get sales metrics for a date range
 */
export async function getSalesMetrics(
  startDate: string,
  endDate: string
): Promise<SalesMetrics> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('total_amount, status, refunded_amount')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) {
    throw new Error(`Failed to get sales metrics: ${error.message}`);
  }

  const metrics: SalesMetrics = {
    totalRevenue: 0,
    ticketsSold: 0,
    averageTicketPrice: 0,
    refundedAmount: 0,
    netRevenue: 0,
  };

  orders?.forEach(order => {
    if (order.status === 'completed') {
      metrics.totalRevenue += order.total_amount || 0;
      metrics.ticketsSold += 1;
    }
    metrics.refundedAmount += order.refunded_amount || 0;
  });

  metrics.netRevenue = metrics.totalRevenue - metrics.refundedAmount;
  metrics.averageTicketPrice = metrics.ticketsSold > 0 
    ? metrics.totalRevenue / metrics.ticketsSold 
    : 0;

  return metrics;
}

/**
 * Get event analytics
 */
export async function getEventAnalytics(eventId: string): Promise<EventAnalytics> {
  const supabase = await createClient();

  // Get event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('title')
    .eq('id', eventId)
    .single();

  if (eventError) {
    throw new Error(`Failed to get event: ${eventError.message}`);
  }

  // Get ticket statistics
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('status, price, ticket_type_id, ticket_types(name)')
    .eq('event_id', eventId);

  if (ticketsError) {
    throw new Error(`Failed to get tickets: ${ticketsError.message}`);
  }

  const totalTickets = tickets?.length || 0;
  const soldTickets = tickets?.filter(t => t.status === 'active' || t.status === 'used').length || 0;
  const scannedTickets = tickets?.filter(t => t.status === 'used').length || 0;
  const revenue = tickets?.reduce((sum, t) => sum + (t.price || 0), 0) || 0;
  const attendanceRate = soldTickets > 0 ? (scannedTickets / soldTickets) * 100 : 0;

  // Group by ticket type
  const salesByType = new Map<string, { sold: number; revenue: number }>();
  
  tickets?.forEach(ticket => {
    const typeData = Array.isArray(ticket.ticket_types) 
      ? ticket.ticket_types[0] 
      : ticket.ticket_types;
    const typeName = typeData?.name || 'Unknown';
    
    if (!salesByType.has(typeName)) {
      salesByType.set(typeName, { sold: 0, revenue: 0 });
    }
    
    const stats = salesByType.get(typeName)!;
    stats.sold += 1;
    stats.revenue += ticket.price || 0;
  });

  return {
    eventId,
    eventName: event.title,
    totalTickets,
    soldTickets,
    scannedTickets,
    revenue,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    salesByType: Array.from(salesByType.entries()).map(([typeName, stats]) => ({
      typeName,
      ...stats,
    })),
  };
}

/**
 * Get membership metrics
 */
export async function getMembershipMetrics(): Promise<MembershipMetrics> {
  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from('user_memberships')
    .select(`
      status,
      created_at,
      membership_tiers (tier_name, annual_price, monthly_price)
    `);

  if (error) {
    throw new Error(`Failed to get membership metrics: ${error.message}`);
  }

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const totalMembers = memberships?.length || 0;
  const activeMembers = memberships?.filter(m => m.status === 'active').length || 0;
  const newMembersThisMonth = memberships?.filter(m => 
    m.status === 'active' && new Date(m.created_at) >= firstDayOfMonth
  ).length || 0;

  // Calculate churn rate (cancelled in last month / active at start of last month)
  const cancelledLastMonth = memberships?.filter(m => 
    m.status === 'cancelled' && 
    new Date(m.created_at) >= lastMonth &&
    new Date(m.created_at) < firstDayOfMonth
  ).length || 0;

  const activeLastMonth = memberships?.filter(m => 
    new Date(m.created_at) < firstDayOfMonth
  ).length || 0;

  const churnRate = activeLastMonth > 0 ? (cancelledLastMonth / activeLastMonth) * 100 : 0;

  // Calculate MRR and ARR
  let mrr = 0;
  const byTier: Record<string, number> = {};

  memberships?.filter(m => m.status === 'active').forEach(membership => {
    const tierData = Array.isArray(membership.membership_tiers)
      ? membership.membership_tiers[0]
      : membership.membership_tiers;
    
    if (tierData) {
      const tierName = tierData.tier_name || 'Unknown';
      byTier[tierName] = (byTier[tierName] || 0) + 1;
      
      // Use monthly price if available, otherwise annual/12
      const monthlyRevenue = tierData.monthly_price || (tierData.annual_price || 0) / 12;
      mrr += monthlyRevenue;
    }
  });

  const MONTHS_IN_YEAR = 12;
  const arr = mrr * MONTHS_IN_YEAR;

  return {
    totalMembers,
    activeMembers,
    newMembersThisMonth,
    churnRate: Math.round(churnRate * 10) / 10,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(arr * 100) / 100,
    byTier,
  };
}

/**
 * Get top selling events
 */
export async function getTopSellingEvents(limit: number = 10): Promise<Array<{
  eventId: string;
  eventName: string;
  ticketsSold: number;
  revenue: number;
}>> {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      tickets (status, price)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get top events: ${error.message}`);
  }

  const results = events?.map(event => {
    const tickets = Array.isArray(event.tickets) ? event.tickets : [];
    const soldTickets = tickets.filter(t => t.status === 'active' || t.status === 'used');
    
    return {
      eventId: event.id,
      eventName: event.title,
      ticketsSold: soldTickets.length,
      revenue: soldTickets.reduce((sum, t) => sum + (t.price || 0), 0),
    };
  }) || [];

  return results.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Get revenue trend over time
 */
export async function getRevenueTrend(
  startDate: string,
  endDate: string,
  interval: 'day' | 'week' | 'month' = 'day'
): Promise<Array<{ date: string; revenue: number; tickets: number }>> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('created_at, total_amount, status')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get revenue trend: ${error.message}`);
  }

  // Group by interval
  const grouped = new Map<string, { revenue: number; tickets: number }>();

  orders?.forEach(order => {
    const date = new Date(order.created_at);
    let key: string;

    switch (interval) {
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      }
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped.has(key)) {
      grouped.set(key, { revenue: 0, tickets: 0 });
    }

    const stats = grouped.get(key)!;
    stats.revenue += order.total_amount || 0;
    stats.tickets += 1;
  });

  return Array.from(grouped.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get user activity statistics
 */
export async function getUserActivityStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averageTicketsPerUser: number;
}> {
  const supabase = await createClient();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const DAYS_ACTIVE_THRESHOLD = 30;
  const activeThreshold = new Date();
  activeThreshold.setDate(activeThreshold.getDate() - DAYS_ACTIVE_THRESHOLD);

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, created_at, last_sign_in_at');

  if (usersError) {
    throw new Error(`Failed to get users: ${usersError.message}`);
  }

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => 
    u.last_sign_in_at && new Date(u.last_sign_in_at) >= activeThreshold
  ).length || 0;
  const newUsersThisMonth = users?.filter(u => 
    new Date(u.created_at) >= firstDayOfMonth
  ).length || 0;

  // Get ticket count
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('user_id');

  if (ticketsError) {
    throw new Error(`Failed to get tickets: ${ticketsError.message}`);
  }

  const averageTicketsPerUser = totalUsers > 0 
    ? (tickets?.length || 0) / totalUsers 
    : 0;

  return {
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    averageTicketsPerUser: Math.round(averageTicketsPerUser * 10) / 10,
  };
}

/**
 * Export analytics data as CSV
 */
export function exportToCSV(
  data: Array<Record<string, any>>,
  filename: string
): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    ),
  ];

  return csvRows.join('\n');
}
