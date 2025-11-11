'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CheckIn, CheckInMethod, CheckInStatus } from '@/types/super-expansion';

export async function getCheckIns(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('check_ins')
    .select(`
      *,
      ticket:tickets(
        ticket_number,
        attendee_name,
        attendee_email,
        tier:ticket_tiers(tier_name)
      )
    `)
    .eq('event_id', eventId)
    .order('checked_in_at', { ascending: false });

  if (error) throw error;
  return data as CheckIn[];
}

export async function getCheckInStats(eventId: string) {
  const supabase = await createClient();
  
  const [checkInsResult, ticketsResult] = await Promise.all([
    supabase
      .from('check_ins')
      .select('id, check_in_status')
      .eq('event_id', eventId),
    supabase
      .from('tickets')
      .select('id, ticket_status')
      .eq('event_id', eventId)
      .in('ticket_status', ['active', 'checked_in'])
  ]);

  if (checkInsResult.error) throw checkInsResult.error;
  if (ticketsResult.error) throw ticketsResult.error;

  const totalTickets = ticketsResult.data.length;
  const totalCheckIns = checkInsResult.data.filter(c => c.check_in_status === 'completed').length;
  const duplicates = checkInsResult.data.filter(c => c.check_in_status === 'duplicate').length;
  const flagged = checkInsResult.data.filter(c => c.check_in_status === 'flagged').length;

  return {
    totalTickets,
    totalCheckIns,
    duplicates,
    flagged,
    checkInRate: totalTickets > 0 ? (totalCheckIns / totalTickets) * 100 : 0,
  };
}

export async function checkInTicket(
  ticketId: string,
  eventId: string,
  method: CheckInMethod = 'manual',
  gate?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if ticket exists and is valid
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id, ticket_status, attendee_name, attendee_email, tier_id')
    .eq('id', ticketId)
    .single();

  if (ticketError) throw ticketError;
  if (!ticket) throw new Error('Ticket not found');

  // Get tier name if tier_id exists
  let tierName: string | null = null;
  if (ticket.tier_id) {
    const { data: tier } = await supabase
      .from('ticket_tiers')
      .select('tier_name')
      .eq('id', ticket.tier_id)
      .single();
    tierName = tier?.tier_name || null;
  }

  // Check if already checked in
  const { data: existingCheckIn } = await supabase
    .from('check_ins')
    .select('id')
    .eq('ticket_id', ticketId)
    .eq('event_id', eventId)
    .single();

  let status: CheckInStatus = 'completed';
  if (existingCheckIn) {
    status = 'duplicate';
  } else if (ticket.ticket_status !== 'active') {
    status = 'invalid';
  }

  // Create check-in record
  const { data: checkIn, error: checkInError } = await supabase
    .from('check_ins')
    .insert({
      event_id: eventId,
      ticket_id: ticketId,
      check_in_method: method,
      check_in_gate: gate,
      checked_in_by: user?.id,
      attendee_name: ticket.attendee_name,
      attendee_email: ticket.attendee_email,
      ticket_tier: tierName,
      check_in_status: status,
    })
    .select()
    .single();

  if (checkInError) throw checkInError;

  // Update ticket status if successful
  if (status === 'completed') {
    await supabase
      .from('tickets')
      .update({
        ticket_status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        checked_in_by: user?.id,
      })
      .eq('id', ticketId);
  }

  revalidatePath(`/portal/events/${eventId}/check-in`);
  return checkIn;
}

export async function scanTicket(
  ticketNumber: string,
  eventId: string,
  method: CheckInMethod = 'qr_scan',
  gate?: string
) {
  const supabase = await createClient();

  // Find ticket by number
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('id')
    .eq('ticket_number', ticketNumber)
    .eq('event_id', eventId)
    .single();

  if (error || !ticket) {
    throw new Error('Invalid ticket number');
  }

  return checkInTicket(ticket.id, eventId, method, gate);
}

export async function flagCheckIn(checkInId: string, issueDescription: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('check_ins')
    .update({
      check_in_status: 'flagged',
      had_issue: true,
      issue_description: issueDescription,
    })
    .eq('id', checkInId)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/check-in');
  return data;
}

export async function resolveCheckInIssue(checkInId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('check_ins')
    .update({
      check_in_status: 'completed',
      issue_resolved: true,
    })
    .eq('id', checkInId)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/check-in');
  return data;
}
