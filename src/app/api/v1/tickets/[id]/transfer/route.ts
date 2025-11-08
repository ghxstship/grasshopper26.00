import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, ErrorResponses } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { z } from 'zod';
import { sendTicketTransferEmail } from '@/lib/email/send';

const transferTicketSchema = z.object({
  recipientEmail: z.string().email('Invalid email address'),
  recipientName: z.string().min(2, 'Recipient name must be at least 2 characters'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

// POST /api/v1/tickets/[id]/transfer - Transfer ticket to another user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.write);
    const user = await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();

    // Validate request body
    const body = await req.json();
    const { recipientEmail, recipientName, message } = transferTicketSchema.parse(body);

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types:ticket_type_id (
          id,
          name,
          event_id
        ),
        orders:order_id (
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      throw ErrorResponses.notFound('Ticket not found');
    }

    // Verify ownership
    if (ticket.orders.user_id !== user.id) {
      throw ErrorResponses.forbidden('You do not own this ticket');
    }

    // Check ticket status
    if (ticket.status !== 'valid') {
      throw ErrorResponses.badRequest('Ticket cannot be transferred (invalid status)');
    }

    // Check if ticket has been scanned
    if (ticket.scanned_at) {
      throw ErrorResponses.badRequest('Ticket has already been scanned and cannot be transferred');
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, start_date, venue_name')
      .eq('id', ticket.ticket_types.event_id)
      .single();

    if (eventError || !event) {
      throw ErrorResponses.notFound('Event not found');
    }

    // Check if event has already started
    const eventStartDate = new Date(event.start_date);
    if (eventStartDate < new Date()) {
      throw ErrorResponses.badRequest('Cannot transfer ticket for an event that has already started');
    }

    // Find or create recipient user profile
    const { data: recipientUser } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', recipientEmail)
      .single();

    let recipientUserId = recipientUser?.user_id;

    // If recipient doesn't have an account, we'll store their email for when they sign up
    // For now, update the ticket with recipient info
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({
        attendee_email: recipientEmail,
        attendee_name: recipientName,
        metadata: {
          ...ticket.metadata,
          transferred_from: user.id,
          transferred_at: new Date().toISOString(),
          transfer_message: message,
        },
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'tickets',
        record_id: id,
        action: 'UPDATE',
        old_values: {
          attendee_email: ticket.attendee_email,
          attendee_name: ticket.attendee_name,
        },
        new_values: {
          attendee_email: recipientEmail,
          attendee_name: recipientName,
        },
        changed_fields: ['attendee_email', 'attendee_name'],
        user_id: user.id,
        user_email: user.email,
      });

    // Send transfer email to recipient
    try {
      await sendTicketTransferEmail({
        recipientEmail,
        recipientName,
        senderName: user.user_metadata?.name || user.email || 'A friend',
        eventName: event.name,
        venueName: event.venue_name || 'TBA',
        ticketId: ticket.id,
        qrCode: ticket.qr_code,
        message: message || undefined,
      } as any); // Type assertion for email template compatibility
    } catch (emailError) {
      console.error('Failed to send transfer email:', emailError);
      // Don't fail the transfer if email fails
    }

    // Create notification for original owner
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'ticket_transfer',
        channel: 'in_app',
        title: 'Ticket Transferred',
        message: `Your ticket for ${event.name} has been transferred to ${recipientName}`,
        metadata: {
          ticketId: id,
          eventId: event.id,
          recipientEmail,
        },
      });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket transferred successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
