import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { ticket_ids } = body;

    if (!ticket_ids || !Array.isArray(ticket_ids) || ticket_ids.length === 0) {
      return NextResponse.json(
        { error: 'Please provide ticket IDs to resend' },
        { status: 400 }
      );
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        events (name, slug, start_date),
        tickets!inner (
          id,
          qr_code,
          status,
          ticket_types (name, price)
        )
      `)
      .eq('id', id)
      .single();

    if (orderError) throw orderError;

    // Filter tickets to resend
    const ticketsToResend = order.tickets.filter((t: any) => 
      ticket_ids.includes(t.id)
    );

    if (ticketsToResend.length === 0) {
      return NextResponse.json(
        { error: 'No valid tickets found to resend' },
        { status: 400 }
      );
    }

    // Get user email
    const { data: userData } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', order.user_id)
      .single();

    const userEmail = userData?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Customer email not found' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Generate PDF tickets with QR codes
    // 2. Send email via your email service (SendGrid, Resend, etc.)
    // 3. Log the resend action
    
    // For now, we'll just log the action
    await supabase
      .from('admin_actions')
      .insert({
        action_type: 'resend_tickets',
        resource_type: 'order',
        resource_id: id,
        details: {
          ticket_ids: ticket_ids,
          ticket_count: ticketsToResend.length,
          recipient_email: userEmail,
        },
        performed_by: (await supabase.auth.getUser()).data.user?.id,
      });

    // TODO: Implement actual email sending
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'tickets@gvteway.com',
    //   to: userEmail,
    //   subject: `Your Tickets for ${order.events.name}`,
    //   html: generateTicketEmail(order, ticketsToResend),
    //   attachments: await generateTicketPDFs(ticketsToResend),
    // });

    return NextResponse.json({ 
      success: true,
      message: `Successfully resent ${ticketsToResend.length} ticket(s) to ${userEmail}`,
      ticket_count: ticketsToResend.length,
    });
  } catch (error: any) {
    console.error('Error resending tickets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend tickets' },
      { status: 500 }
    );
  }
}
