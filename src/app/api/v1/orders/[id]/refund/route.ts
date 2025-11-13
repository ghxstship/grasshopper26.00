import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handleAPIError, ErrorResponses } from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/api/middleware';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const refundOrderSchema = z.object({
  reason: z.enum(['requested_by_customer', 'duplicate', 'fraudulent', 'event_cancelled', 'other']),
  amount: z.number().positive().optional(), // Partial refund amount in cents
  notes: z.string().max(500).optional(),
});

// POST /api/v1/orders/[id]/refund - Process order refund
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
    const { reason, amount, notes } = refundOrderSchema.parse(body);

    // Check if user has admin role (only admins can process refunds)
    const { data: orgAssignment, error: roleError } = await supabase
      .from('brand_team_assignments')
      .select('team_role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (roleError || !orgAssignment || !['admin', 'super_admin'].includes(orgAssignment.team_role)) {
      throw ErrorResponses.forbidden('Only administrators can process refunds');
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        tickets:tickets (
          id,
          ticket_type_id,
          status,
          scanned_at
        )
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      throw ErrorResponses.notFound('Order not found');
    }

    // Check order status
    if (order.status === 'refunded') {
      throw ErrorResponses.badRequest('Order has already been refunded');
    }

    if (order.status === 'cancelled') {
      throw ErrorResponses.badRequest('Order has been cancelled');
    }

    if (order.status !== 'completed') {
      throw ErrorResponses.badRequest('Only completed orders can be refunded');
    }

    // Check if any tickets have been scanned
    const scannedTickets = order.tickets.filter((t: any) => t.scanned_at);
    if (scannedTickets.length > 0) {
      throw ErrorResponses.badRequest(
        `Cannot refund order: ${scannedTickets.length} ticket(s) have already been scanned`
      );
    }

    // Check if payment intent exists
    if (!order.payment_intent_id) {
      throw ErrorResponses.badRequest('No payment information found for this order');
    }

    // Calculate refund amount
    const orderTotal = parseFloat(order.total_amount);
    const refundAmount = amount || Math.round(orderTotal * 100); // Convert to cents if full refund

    if (amount && amount > Math.round(orderTotal * 100)) {
      throw ErrorResponses.badRequest('Refund amount cannot exceed order total');
    }

    // Process refund through Stripe
    let refund: Stripe.Refund;
    try {
      // Map our reason to Stripe's accepted reasons
      const stripeReason = reason === 'event_cancelled' ? 'requested_by_customer' : 
                          (reason === 'other' ? undefined : reason);
      
      refund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: refundAmount,
        reason: stripeReason as Stripe.RefundCreateParams.Reason | undefined,
        metadata: {
          order_id: order.id,
          processed_by: user.id,
          notes: notes || '',
          original_reason: reason,
        },
      });
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError);
      throw ErrorResponses.paymentFailed(
        `Refund failed: ${stripeError.message || 'Unknown error'}`
      );
    }

    // Update order status
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status: 'refunded',
        metadata: {
          ...order.metadata,
          refund_id: refund.id,
          refund_amount: refundAmount,
          refund_reason: reason,
          refund_notes: notes,
          refunded_at: new Date().toISOString(),
          refunded_by: user.id,
        },
      })
      .eq('id', id);

    if (updateOrderError) {
      console.error('Failed to update order status:', updateOrderError);
      // Refund was processed but status update failed - log for manual review
    }

    // Update all tickets to refunded status
    const { error: updateTicketsError } = await supabase
      .from('tickets')
      .update({
        status: 'refunded',
        metadata: {
          refunded_at: new Date().toISOString(),
          refund_id: refund.id,
        },
      })
      .eq('order_id', id);

    if (updateTicketsError) {
      console.error('Failed to update ticket statuses:', updateTicketsError);
    }

    // Restore inventory for each ticket type
    const ticketTypeCounts: Record<string, number> = {};
    order.tickets.forEach((ticket: any) => {
      ticketTypeCounts[ticket.ticket_type_id] = (ticketTypeCounts[ticket.ticket_type_id] || 0) + 1;
    });

    for (const [ticketTypeId, count] of Object.entries(ticketTypeCounts)) {
      const { error: inventoryError } = await supabase.rpc('decrement_tickets_sold', {
        ticket_type_id: ticketTypeId,
        quantity: count,
      });

      if (inventoryError) {
        console.error('Failed to restore inventory:', inventoryError);
      }
    }

    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'orders',
        record_id: id,
        action: 'UPDATE',
        old_values: {
          status: order.status,
        },
        new_values: {
          status: 'refunded',
          refund_id: refund.id,
        },
        changed_fields: ['status'],
        user_id: user.id,
        user_email: user.email,
        metadata: {
          reason,
          amount: refundAmount,
          notes,
        },
      });

    // Create notification for customer
    await supabase
      .from('notifications')
      .insert({
        user_id: order.user_id,
        type: 'refund_processed',
        channel: 'email',
        title: 'Refund Processed',
        message: `Your refund of $${(refundAmount / 100).toFixed(2)} has been processed`,
        metadata: {
          orderId: order.id,
          refundId: refund.id,
          amount: refundAmount,
        },
      });

    // Notify waitlist if applicable
    if (order.tickets.length > 0) {
      const firstTicket = order.tickets[0];
      
      // Get event ID from ticket
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('event_id')
        .eq('id', firstTicket.ticket_type_id)
        .single();

      if (ticketType) {
        // Trigger waitlist notification (handled by database function)
        await supabase.rpc('notify_waitlist', {
          p_event_id: ticketType.event_id,
          p_ticket_type_id: firstTicket.ticket_type_id,
          p_quantity: order.tickets.length,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        refundId: refund.id,
        amount: refundAmount / 100,
        currency: refund.currency,
        status: refund.status,
        reason,
      },
      message: 'Refund processed successfully',
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}

// GET /api/v1/orders/[id]/refund - Check refund eligibility
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await rateLimit(req, RateLimitPresets.read);
    const user = await requireAuth(req);
    const { id } = await params;

    const supabase = await createClient();

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        tickets:tickets (
          id,
          status,
          scanned_at
        ),
        events:event_id (
          id,
          name,
          start_date,
          status
        )
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      throw ErrorResponses.notFound('Order not found');
    }

    // Check ownership or admin access
    const { data: orgAssignment } = await supabase
      .from('brand_team_assignments')
      .select('team_role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    const isAdmin = orgAssignment && ['admin', 'super_admin'].includes(orgAssignment.team_role);
    const isOwner = order.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw ErrorResponses.forbidden('Access denied');
    }

    // Determine eligibility
    const isRefunded = order.status === 'refunded';
    const isCancelled = order.status === 'cancelled';
    const isCompleted = order.status === 'completed';
    const scannedTickets = order.tickets.filter((t: any) => t.scanned_at);
    const hasScannedTickets = scannedTickets.length > 0;

    let eligible = false;
    let reason = '';

    if (isRefunded) {
      reason = 'Order has already been refunded';
    } else if (isCancelled) {
      reason = 'Order has been cancelled';
    } else if (!isCompleted) {
      reason = 'Only completed orders can be refunded';
    } else if (hasScannedTickets) {
      reason = `${scannedTickets.length} ticket(s) have been scanned`;
    } else if (!order.payment_intent_id) {
      reason = 'No payment information found';
    } else {
      eligible = true;
      reason = 'Order is eligible for refund';
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        eligible,
        reason,
        orderStatus: order.status,
        totalAmount: parseFloat(order.total_amount),
        ticketCount: order.tickets.length,
        scannedTicketCount: scannedTickets.length,
        canPartialRefund: eligible && !hasScannedTickets,
      },
    });
  } catch (error) {
    return handleAPIError(error, req.url);
  }
}
