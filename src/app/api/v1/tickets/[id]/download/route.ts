import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types (
          name,
          price,
          events (
            id,
            name,
            start_date,
            venue_name,
            venue_address
          )
        ),
        orders!inner (
          user_id
        )
      `)
      .eq('id', id)
      .eq('orders.user_id', user.id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Generate PDF ticket (placeholder - implement actual PDF generation)
    const pdfData = {
      ticket_id: ticket.id,
      qr_code: ticket.qr_code,
      attendee_name: ticket.attendee_name,
      event: ticket.ticket_types?.events,
      ticket_type: ticket.ticket_types?.name,
    };

    return NextResponse.json({ 
      download_url: `/api/tickets/${ticket.id}/pdf`,
      ticket: pdfData 
    });
  } catch (error) {
    console.error('Error generating ticket download:', error);
    return NextResponse.json(
      { error: 'Failed to generate ticket download' },
      { status: 500 }
    );
  }
}
