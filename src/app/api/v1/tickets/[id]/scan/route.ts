import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, ErrorResponses } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { z } from 'zod';

const scanTicketSchema = z.object({
  location: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// POST /api/v1/tickets/[id]/scan - Scan ticket at venue (staff only)
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
    const { location, notes } = scanTicketSchema.parse(body);

    // Check if user has staff/admin role
    const { data: orgAssignment, error: roleError } = await supabase
      .from('brand_team_assignments')
      .select('team_role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (roleError || !orgAssignment || !['admin', 'staff', 'super_admin'].includes(orgAssignment.team_role)) {
      throw ErrorResponses.forbidden('Only staff members can scan tickets');
    }

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types:ticket_type_id (
          id,
          name,
          event_id,
          events:event_id (
            id,
            name,
            start_date,
            end_date,
            status
          )
        )
      `)
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      throw ErrorResponses.notFound('Ticket not found');
    }

    // Check ticket status
    if (ticket.status === 'cancelled') {
      throw ErrorResponses.badRequest('This ticket has been cancelled');
    }

    if (ticket.status === 'refunded') {
      throw ErrorResponses.badRequest('This ticket has been refunded');
    }

    if (ticket.status === 'transferred') {
      throw ErrorResponses.badRequest('This ticket has been transferred');
    }

    // Check if already scanned
    if (ticket.scanned_at) {
      const scannedTime = new Date(ticket.scanned_at);
      const timeSinceScanned = Date.now() - scannedTime.getTime();
      const minutesSinceScanned = Math.floor(timeSinceScanned / 1000 / 60);

      return NextResponse.json({
        success: false,
        error: 'ALREADY_SCANNED',
        message: `This ticket was already scanned ${minutesSinceScanned} minutes ago`,
        data: {
          scannedAt: ticket.scanned_at,
          scannedBy: ticket.scanned_by,
          minutesAgo: minutesSinceScanned,
        },
      }, { status: 409 });
    }

    // Get event details
    const event = ticket.ticket_types.events;

    // Check if event is active
    if (event.status === 'cancelled') {
      throw ErrorResponses.badRequest('This event has been cancelled');
    }

    // Check event timing (allow scanning 2 hours before start time)
    const eventStartDate = new Date(event.start_date);
    const twoHoursBeforeStart = new Date(eventStartDate.getTime() - 2 * 60 * 60 * 1000);
    const now = new Date();

    if (now < twoHoursBeforeStart) {
      const hoursUntilScanningAllowed = Math.ceil((twoHoursBeforeStart.getTime() - now.getTime()) / 1000 / 60 / 60);
      throw ErrorResponses.badRequest(
        `Ticket scanning opens ${hoursUntilScanningAllowed} hours before the event starts`
      );
    }

    // Check if event has ended (allow scanning up to 2 hours after end)
    if (event.end_date) {
      const eventEndDate = new Date(event.end_date);
      const twoHoursAfterEnd = new Date(eventEndDate.getTime() + 2 * 60 * 60 * 1000);
      
      if (now > twoHoursAfterEnd) {
        throw ErrorResponses.badRequest('This event has ended and ticket scanning is closed');
      }
    }

    // Update ticket as scanned
    const { data: scannedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'scanned',
        scanned_at: new Date().toISOString(),
        scanned_by: user.id,
        metadata: {
          ...ticket.metadata,
          scan_location: location,
          scan_notes: notes,
          scanner_email: user.email,
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
          status: ticket.status,
          scanned_at: null,
        },
        new_values: {
          status: 'scanned',
          scanned_at: scannedTicket.scanned_at,
        },
        changed_fields: ['status', 'scanned_at', 'scanned_by'],
        user_id: user.id,
        user_email: user.email,
      });

    // Get attendee info for response
    const attendeeName = ticket.attendee_name || 'Guest';
    const attendeeEmail = ticket.attendee_email || 'N/A';

    return NextResponse.json({
      success: true,
      data: {
        ticket: scannedTicket,
        event: {
          id: event.id,
          name: event.name,
          startDate: event.start_date,
        },
        attendee: {
          name: attendeeName,
          email: attendeeEmail,
        },
      },
      message: `Ticket scanned successfully. Welcome ${attendeeName}!`,
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// GET /api/v1/tickets/[id]/scan - Verify ticket status (for scanner apps)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.read);
    const { id } = await params;
    const user = await requireAuth(req);

    const supabase = await createClient();

    // Check if user has staff/admin role
    const { data: orgAssignment, error: roleError } = await supabase
      .from('brand_team_assignments')
      .select('team_role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (roleError || !orgAssignment || !['admin', 'staff', 'super_admin'].includes(orgAssignment.team_role)) {
      throw ErrorResponses.forbidden('Only staff members can verify tickets');
    }

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types:ticket_type_id (
          name,
          events:event_id (
            name,
            start_date,
            status
          )
        )
      `)
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      throw ErrorResponses.notFound('Ticket not found');
    }

    // Determine ticket validity
    const isValid = ticket.status === 'valid' && !ticket.scanned_at;
    const isScanned = !!ticket.scanned_at;
    const isCancelled = ticket.status === 'cancelled';
    const isRefunded = ticket.status === 'refunded';

    let statusMessage = '';
    if (isValid) {
      statusMessage = 'Valid - Ready to scan';
    } else if (isScanned) {
      const scannedTime = new Date(ticket.scanned_at);
      const minutesAgo = Math.floor((Date.now() - scannedTime.getTime()) / 1000 / 60);
      statusMessage = `Already scanned ${minutesAgo} minutes ago`;
    } else if (isCancelled) {
      statusMessage = 'Cancelled';
    } else if (isRefunded) {
      statusMessage = 'Refunded';
    } else {
      statusMessage = 'Invalid';
    }

    return NextResponse.json({
      success: true,
      data: {
        ticketId: ticket.id,
        status: ticket.status,
        isValid,
        isScanned,
        scannedAt: ticket.scanned_at,
        attendeeName: ticket.attendee_name,
        attendeeEmail: ticket.attendee_email,
        event: {
          name: ticket.ticket_types.events.name,
          startDate: ticket.ticket_types.events.start_date,
          status: ticket.ticket_types.events.status,
        },
        ticketType: ticket.ticket_types.name,
        statusMessage,
      },
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
