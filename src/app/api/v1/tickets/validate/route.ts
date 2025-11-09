import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { asyncHandler } from '@/lib/api/error-handler';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

type ValidateResponse = {
  success: boolean;
  valid?: boolean;
  error?: string | null;
  ticket?: any;
  message?: string;
};

export const POST = asyncHandler<ValidateResponse>(async (req: Request) => {
  const nextReq = req as NextRequest;
  await rateLimit(nextReq, RateLimitPresets.write);

  const supabase = await createClient();
  const { ticketId } = await nextReq.json();

  if (!ticketId) {
    return NextResponse.json(
      { success: false, error: 'Ticket ID required' },
      { status: 400 }
    );
  }

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      ticket_types (
        name,
        events (
          id,
          name,
          start_date,
          end_date,
          venue_name
        )
      )
    `)
    .eq('id', ticketId)
    .single();

  if (error || !ticket) {
    return NextResponse.json(
      { success: false, valid: false, error: 'Ticket not found', ticket: null },
      { status: 404 }
    );
  }

  if (ticket.status === 'used') {
    return NextResponse.json({
      success: true,
      valid: false,
      ticket,
      message: 'Ticket already used',
      error: null,
    });
  }

  if (ticket.status !== 'active') {
    return NextResponse.json({
      success: true,
      valid: false,
      ticket,
      message: 'Ticket is not active',
      error: null,
    });
  }

  return NextResponse.json({
    success: true,
    valid: true,
    ticket,
    error: null,
  });
});
