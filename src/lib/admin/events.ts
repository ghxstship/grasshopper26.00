/**
 * Admin Event Management System
 * Create, update, and manage events and ticket types
 */

import { createClient } from '@/lib/supabase/server';

export interface CreateEventData {
  title: string;
  description: string;
  venue_name: string;
  venue_address: string;
  start_date: string;
  end_date?: string;
  status: 'draft' | 'published' | 'cancelled';
  hero_image_url?: string;
  capacity?: number;
  age_restriction?: number;
  tags?: string[];
}

export interface CreateTicketTypeData {
  event_id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  max_per_order?: number;
  sale_start_date?: string;
  sale_end_date?: string;
  member_only?: boolean;
  tier_required?: number;
}

/**
 * Create new event
 */
export async function createEvent(data: CreateEventData, createdBy: string): Promise<string> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      ...data,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return event.id;
}

/**
 * Update event
 */
export async function updateEvent(
  eventId: string,
  data: Partial<CreateEventData>
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const supabase = await createClient();

  // Check if event has sold tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id')
    .eq('event_id', eventId)
    .limit(1);

  if (tickets && tickets.length > 0) {
    throw new Error('Cannot delete event with sold tickets. Cancel the event instead.');
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}

/**
 * Publish event
 */
export async function publishEvent(eventId: string): Promise<void> {
  const supabase = await createClient();

  // Verify event has at least one ticket type
  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('id')
    .eq('event_id', eventId)
    .limit(1);

  if (!ticketTypes || ticketTypes.length === 0) {
    throw new Error('Cannot publish event without ticket types');
  }

  const { error } = await supabase
    .from('events')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to publish event: ${error.message}`);
  }
}

/**
 * Cancel event
 */
export async function cancelEvent(eventId: string, reason?: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to cancel event: ${error.message}`);
  }

  // Send cancellation emails to all ticket holders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      attendee_email,
      tickets(id, ticket_type_id, attendee_name)
    `)
    .eq('event_id', eventId)
    .eq('status', 'completed');

  if (orders && orders.length > 0) {
    const { data: event } = await supabase
      .from('events')
      .select('name, start_date, venue_name')
      .eq('id', eventId)
      .single();

    // Send cancellation email to each ticket holder
    for (const order of orders) {
      try {
        // Import dynamically to avoid circular dependencies
        const { sendEventCancellationEmail } = await import('@/lib/email/send');
        
        await sendEventCancellationEmail({
          to: order.attendee_email,
          eventName: event?.name || 'Event',
          eventDate: event?.start_date || '',
          venueName: event?.venue_name || '',
          reason: reason || 'unforeseen circumstances',
          ticketCount: order.tickets?.length || 0,
        });
      } catch (emailError) {
        console.error(`Failed to send cancellation email to ${order.attendee_email}:`, emailError);
      }
    }
  }
}

/**
 * Create ticket type
 */
export async function createTicketType(data: CreateTicketTypeData): Promise<string> {
  const supabase = await createClient();

  const { data: ticketType, error } = await supabase
    .from('ticket_types')
    .insert({
      ...data,
      available_quantity: data.quantity,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create ticket type: ${error.message}`);
  }

  return ticketType.id;
}

/**
 * Update ticket type
 */
export async function updateTicketType(
  ticketTypeId: string,
  data: Partial<CreateTicketTypeData>
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('ticket_types')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketTypeId);

  if (error) {
    throw new Error(`Failed to update ticket type: ${error.message}`);
  }
}

/**
 * Delete ticket type
 */
export async function deleteTicketType(ticketTypeId: string): Promise<void> {
  const supabase = await createClient();

  // Check if any tickets have been sold
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id')
    .eq('ticket_type_id', ticketTypeId)
    .limit(1);

  if (tickets && tickets.length > 0) {
    throw new Error('Cannot delete ticket type with sold tickets');
  }

  const { error } = await supabase
    .from('ticket_types')
    .delete()
    .eq('id', ticketTypeId);

  if (error) {
    throw new Error(`Failed to delete ticket type: ${error.message}`);
  }
}

/**
 * Adjust ticket inventory
 */
export async function adjustTicketInventory(
  ticketTypeId: string,
  adjustment: number,
  reason: string
): Promise<void> {
  const supabase = await createClient();

  // Get current inventory
  const { data: ticketType, error: fetchError } = await supabase
    .from('ticket_types')
    .select('available_quantity, quantity')
    .eq('id', ticketTypeId)
    .single();

  if (fetchError || !ticketType) {
    throw new Error('Ticket type not found');
  }

  const newAvailable = ticketType.available_quantity + adjustment;
  const newTotal = ticketType.quantity + adjustment;

  if (newAvailable < 0 || newTotal < 0) {
    throw new Error('Cannot reduce inventory below zero');
  }

  const { error: updateError } = await supabase
    .from('ticket_types')
    .update({
      available_quantity: newAvailable,
      quantity: newTotal,
    })
    .eq('id', ticketTypeId);

  if (updateError) {
    throw new Error(`Failed to adjust inventory: ${updateError.message}`);
  }

  // Log the adjustment
  await supabase.from('inventory_adjustments').insert({
    ticket_type_id: ticketTypeId,
    adjustment,
    reason,
    created_at: new Date().toISOString(),
  });
}

/**
 * Get event with full details
 */
export async function getEventDetails(eventId: string): Promise<any> {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types (*),
      tickets (count)
    `)
    .eq('id', eventId)
    .single();

  if (error) {
    throw new Error(`Failed to get event details: ${error.message}`);
  }

  return event;
}

/**
 * List all events with filters
 */
export async function listEvents(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select('*, ticket_types(count)')
    .order('start_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('start_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('start_date', filters.endDate);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list events: ${error.message}`);
  }

  return data || [];
}

/**
 * Duplicate event
 */
export async function duplicateEvent(
  eventId: string,
  newTitle: string,
  newStartDate: string
): Promise<string> {
  const supabase = await createClient();

  // Get original event
  const { data: originalEvent, error: fetchError } = await supabase
    .from('events')
    .select('*, ticket_types(*)')
    .eq('id', eventId)
    .single();

  if (fetchError || !originalEvent) {
    throw new Error('Event not found');
  }

  // Create new event
  const { data: newEvent, error: createError } = await supabase
    .from('events')
    .insert({
      title: newTitle,
      description: originalEvent.description,
      venue_name: originalEvent.venue_name,
      venue_address: originalEvent.venue_address,
      start_date: newStartDate,
      status: 'draft',
      hero_image_url: originalEvent.hero_image_url,
      capacity: originalEvent.capacity,
      age_restriction: originalEvent.age_restriction,
      tags: originalEvent.tags,
    })
    .select('id')
    .single();

  if (createError) {
    throw new Error(`Failed to duplicate event: ${createError.message}`);
  }

  // Duplicate ticket types
  const ticketTypes = Array.isArray(originalEvent.ticket_types) 
    ? originalEvent.ticket_types 
    : [];

  for (const ticketType of ticketTypes) {
    await supabase.from('ticket_types').insert({
      event_id: newEvent.id,
      name: ticketType.name,
      description: ticketType.description,
      price: ticketType.price,
      quantity: ticketType.quantity,
      available_quantity: ticketType.quantity,
      max_per_order: ticketType.max_per_order,
      member_only: ticketType.member_only,
      tier_required: ticketType.tier_required,
    });
  }

  return newEvent.id;
}

/**
 * Get event capacity status
 */
export async function getEventCapacity(eventId: string): Promise<{
  totalCapacity: number;
  soldTickets: number;
  availableTickets: number;
  percentageSold: number;
}> {
  const supabase = await createClient();

  const { data: ticketTypes, error } = await supabase
    .from('ticket_types')
    .select('quantity, available_quantity')
    .eq('event_id', eventId);

  if (error) {
    throw new Error(`Failed to get capacity: ${error.message}`);
  }

  const totalCapacity = ticketTypes?.reduce((sum, tt) => sum + tt.quantity, 0) || 0;
  const availableTickets = ticketTypes?.reduce((sum, tt) => sum + tt.available_quantity, 0) || 0;
  const soldTickets = totalCapacity - availableTickets;
  const percentageSold = totalCapacity > 0 ? (soldTickets / totalCapacity) * 100 : 0;

  return {
    totalCapacity,
    soldTickets,
    availableTickets,
    percentageSold: Math.round(percentageSold * 10) / 10,
  };
}
