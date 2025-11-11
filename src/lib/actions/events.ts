'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getEvents(organizationId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('events')
    .select(`
      *,
      venue:venues(venue_name, city, state)
    `)
    .order('event_start_date', { ascending: false });

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venue:venues(*),
      organization:organizations(organization_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUpcomingEvents(organizationId?: string, limit = 10) {
  const supabase = await createClient();
  
  let query = supabase
    .from('events')
    .select('*')
    .gte('event_start_date', new Date().toISOString())
    .order('event_start_date')
    .limit(limit);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function createEvent(organizationId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const event = {
    organization_id: organizationId,
    event_name: formData.get('event_name') as string,
    event_slug: (formData.get('event_name') as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
    event_start_date: formData.get('event_start_date') as string,
    event_end_date: formData.get('event_end_date') as string,
    venue_id: formData.get('venue_id') as string || null,
    total_capacity: parseInt(formData.get('total_capacity') as string) || 0,
    event_status: 'planning',
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/portal/events');
  return data;
}

export async function updateEventStatus(id: string, status: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .update({ event_status: status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/portal/events');
  revalidatePath(`/portal/events/${id}`);
  return data;
}

export async function getEventKPIs(eventId: string) {
  const supabase = await createClient();

  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!event) return null;

  // Get ticket stats
  const { data: tickets } = await supabase
    .from('tickets')
    .select('final_price, ticket_status')
    .eq('event_id', eventId);

  const ticketRevenue = tickets
    ?.filter(t => ['active', 'checked_in'].includes(t.ticket_status))
    .reduce((sum, t) => sum + t.final_price, 0) || 0;

  const ticketsSold = tickets
    ?.filter(t => ['active', 'checked_in'].includes(t.ticket_status))
    .length || 0;

  // Get budget stats
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('event_id', eventId)
    .eq('budget_status', 'approved');

  const activeBudget = budgets?.[0];

  // Get task stats
  const { data: tasks } = await supabase
    .from('tasks')
    .select('task_status, due_date')
    .eq('event_id', eventId);

  const completedTasks = tasks?.filter(t => t.task_status === 'completed').length || 0;
  const totalTasks = tasks?.length || 0;
  const overdueTasks = tasks?.filter(t => 
    new Date(t.due_date) < new Date() && t.task_status !== 'completed'
  ).length || 0;

  // Get staff stats
  const { data: staff } = await supabase
    .from('staff_assignments')
    .select('total_cost')
    .eq('event_id', eventId);

  const laborCost = staff?.reduce((sum, s) => sum + (s.total_cost || 0), 0) || 0;

  return {
    eventName: event.event_name,
    eventDate: event.event_start_date,
    ticketRevenue,
    ticketsSold,
    capacity: event.total_capacity,
    sellThroughRate: event.total_capacity > 0 ? (ticketsSold / event.total_capacity) * 100 : 0,
    budgetedRevenue: activeBudget?.total_revenue_budgeted || 0,
    budgetedExpenses: activeBudget?.total_expenses_budgeted || 0,
    projectedProfit: activeBudget?.total_profit_budgeted || 0,
    actualExpenses: activeBudget?.total_expenses_actual || 0,
    laborCost,
    completedTasks,
    totalTasks,
    overdueTasks,
    taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
  };
}
