import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketTypeId, eventId } = await request.json();

    if (!ticketTypeId || !eventId) {
      return NextResponse.json(
        { error: 'Ticket type and event are required' },
        { status: 400 }
      );
    }

    // Get active membership
    const { data: membership } = await supabase
      .from('user_memberships')
      .select('id, membership_tier_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'No active membership found' },
        { status: 404 }
      );
    }

    // Get credit balance
    const { data: creditRecord } = await supabase
      .from('membership_ticket_credits')
      .select('*')
      .eq('user_membership_id', membership.id)
      .single();

    if (!creditRecord || creditRecord.remaining_credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Get ticket type details
    const { data: ticketType } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', ticketTypeId)
      .single();

    if (!ticketType) {
      return NextResponse.json(
        { error: 'Ticket type not found' },
        { status: 404 }
      );
    }

    // Create order with zero amount (credit redemption)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        event_id: eventId,
        total_amount: '0.00',
        status: 'completed',
        payment_method: 'membership_credit',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        order_id: order.id,
        ticket_type_id: ticketTypeId,
        status: 'active',
        qr_code: `TICKET-${order.id}-${Date.now()}`,
        attendee_name: user.user_metadata?.name || user.email,
        attendee_email: user.email,
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Deduct credit
    const { error: creditError } = await supabase
      .from('membership_ticket_credits')
      .update({
        remaining_credits: creditRecord.remaining_credits - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creditRecord.id);

    if (creditError) throw creditError;

    // Log benefit usage
    await supabase.from('membership_benefit_usage').insert({
      user_membership_id: membership.id,
      benefit_type: 'ticket_credit',
      usage_count: 1,
      metadata: {
        ticket_id: ticket.id,
        order_id: order.id,
        event_id: eventId,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      ticket,
      remainingCredits: creditRecord.remaining_credits - 1,
    });
  } catch (error: any) {
    console.error('Credit redemption error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to redeem credit' },
      { status: 500 }
    );
  }
}
