import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTicketPDF } from '@/lib/tickets/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ticket with event and order details
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types (
          name,
          price
        ),
        orders!inner (
          id,
          user_id,
          order_number,
          events (
            name,
            start_date,
            venue_name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Verify ticket belongs to user
    if (ticket.orders.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate PDF
    const pdfBlob = await generateTicketPDF({
      id: ticket.id,
      eventName: ticket.orders.events.name,
      eventDate: ticket.orders.events.start_date,
      venue: ticket.orders.events.venue_name || 'TBA',
      ticketType: ticket.ticket_types.name,
      attendeeName: ticket.attendee_name || user.user_metadata?.name || user.email,
      orderNumber: ticket.orders.id.slice(0, 8).toUpperCase(),
      qrCode: ticket.qr_code,
      price: parseFloat(ticket.ticket_types.price),
    });

    // Convert blob to buffer
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${ticket.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Ticket download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate ticket' },
      { status: 500 }
    );
  }
}
