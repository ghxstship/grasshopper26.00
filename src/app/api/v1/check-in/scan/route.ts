import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketNumber, eventId, method = 'qr_scan', gate } = await request.json();

    if (!ticketNumber || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, ticket_status, attendee_name, attendee_email, tier_id')
      .eq('ticket_number', ticketNumber)
      .eq('event_id', eventId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Invalid ticket number' },
        { status: 404 }
      );
    }

    let tierName: string | null = null;
    if (ticket.tier_id) {
      const { data: tier } = await supabase
        .from('ticket_tiers')
        .select('tier_name')
        .eq('id', ticket.tier_id)
        .single();
      tierName = tier?.tier_name || null;
    }

    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('ticket_id', ticket.id)
      .eq('event_id', eventId)
      .single();

    let status = 'completed';
    if (existingCheckIn) {
      status = 'duplicate';
    } else if (ticket.ticket_status !== 'active') {
      status = 'invalid';
    }

    const { data: checkIn, error: checkInError } = await supabase
      .from('check_ins')
      .insert({
        event_id: eventId,
        ticket_id: ticket.id,
        check_in_method: method,
        check_in_gate: gate,
        checked_in_by: user.id,
        attendee_name: ticket.attendee_name,
        attendee_email: ticket.attendee_email,
        ticket_tier: tierName,
        check_in_status: status,
      })
      .select()
      .single();

    if (checkInError) throw checkInError;

    if (status === 'completed') {
      await supabase
        .from('tickets')
        .update({
          ticket_status: 'checked_in',
          checked_in_at: new Date().toISOString(),
          checked_in_by: user.id,
        })
        .eq('id', ticket.id);
    }

    return NextResponse.json({ data: checkIn });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
