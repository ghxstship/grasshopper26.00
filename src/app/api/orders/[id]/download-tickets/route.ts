import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMultipleTicketsPDF } from '@/lib/tickets/pdf-generator';

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

    // Fetch order with tickets and event details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        events (
          name,
          start_date,
          venue_name
        ),
        tickets (
          id,
          qr_code,
          attendee_name,
          ticket_types (
            name,
            price
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.tickets || order.tickets.length === 0) {
      return NextResponse.json({ error: 'No tickets found' }, { status: 404 });
    }

    // Prepare ticket data for PDF generation
    const ticketData = order.tickets.map((ticket: any) => ({
      id: ticket.id,
      eventName: order.events.name,
      eventDate: order.events.start_date,
      venue: order.events.venue_name || 'TBA',
      ticketType: ticket.ticket_types.name,
      attendeeName: ticket.attendee_name || user.user_metadata?.name || user.email,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      qrCode: ticket.qr_code,
      price: parseFloat(ticket.ticket_types.price),
    }));

    // Generate PDF with all tickets
    const pdfBlob = await generateMultipleTicketsPDF(ticketData);

    // Convert blob to buffer
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tickets-order-${order.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Tickets download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate tickets' },
      { status: 500 }
    );
  }
}
