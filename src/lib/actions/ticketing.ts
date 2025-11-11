'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TicketTier, Ticket } from '@/types/super-expansion';

export async function getTicketTiersByEvent(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data as TicketTier[];
}

export async function createTicketTier(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const tier = {
    event_id: eventId,
    tier_name: formData.get('tier_name') as string,
    tier_slug: (formData.get('tier_name') as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
    tier_type: formData.get('tier_type') as string,
    base_price: parseFloat(formData.get('base_price') as string),
    fees: parseFloat(formData.get('fees') as string) || 0,
    taxes: parseFloat(formData.get('taxes') as string) || 0,
    total_capacity: parseInt(formData.get('total_capacity') as string),
    sale_start_date: formData.get('sale_start_date') as string || null,
    sale_end_date: formData.get('sale_end_date') as string || null,
    min_purchase_quantity: parseInt(formData.get('min_purchase_quantity') as string) || 1,
    max_purchase_quantity: parseInt(formData.get('max_purchase_quantity') as string) || 10,
  };

  const { data, error } = await supabase
    .from('ticket_tiers')
    .insert(tier)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${eventId}/tickets`);
  return data;
}

export async function updateTicketTier(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates = {
    tier_name: formData.get('tier_name') as string,
    base_price: parseFloat(formData.get('base_price') as string),
    fees: parseFloat(formData.get('fees') as string),
    taxes: parseFloat(formData.get('taxes') as string),
    total_capacity: parseInt(formData.get('total_capacity') as string),
    is_visible: formData.get('is_visible') === 'true',
    is_active: formData.get('is_active') === 'true',
  };

  const { data, error } = await supabase
    .from('ticket_tiers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  const { data: tier } = await supabase
    .from('ticket_tiers')
    .select('event_id')
    .eq('id', id)
    .single();

  revalidatePath(`/portal/events/${tier?.event_id}/tickets`);
  return data;
}

export async function getTicketsByEvent(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      tier:ticket_tiers(tier_name, tier_type)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTicketSalesStats(eventId: string) {
  const supabase = await createClient();
  
  const { data: tiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', eventId);

  const { data: tickets } = await supabase
    .from('tickets')
    .select('final_price, ticket_status')
    .eq('event_id', eventId);

  if (!tiers || !tickets) return null;

  const totalCapacity = tiers.reduce((sum, tier) => sum + tier.total_capacity, 0);
  const soldTickets = tickets.filter(t => 
    ['active', 'checked_in'].includes(t.ticket_status)
  ).length;
  const totalRevenue = tickets
    .filter(t => ['active', 'checked_in'].includes(t.ticket_status))
    .reduce((sum, t) => sum + t.final_price, 0);

  return {
    totalCapacity,
    soldTickets,
    availableTickets: totalCapacity - soldTickets,
    totalRevenue,
    sellThroughRate: totalCapacity > 0 ? (soldTickets / totalCapacity) * 100 : 0,
  };
}

export async function checkInTicket(ticketId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('tickets')
    .update({
      ticket_status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id,
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;

  // Create check-in record
  await supabase
    .from('check_ins')
    .insert({
      event_id: data.event_id,
      ticket_id: ticketId,
      checked_in_by: user.id,
      check_in_method: 'manual',
      check_in_status: 'completed',
    });

  revalidatePath(`/portal/events/${data.event_id}/check-in`);
  return data;
}
