/**
 * Refund Service
 * Comprehensive refund processing with validation and automation
 */

import { createClient } from '@/lib/supabase/server';
import { ErrorResponses } from '@/lib/api/error-handler';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface RefundRequest {
  orderId: string;
  userId: string;
  reason: 'requested_by_customer' | 'duplicate' | 'fraudulent' | 'event_cancelled' | 'other';
  amount?: number; // Partial refund amount in cents
  notes?: string;
  processedBy: string;
}

export interface RefundEligibility {
  eligible: boolean;
  reason: string;
  orderStatus: string;
  totalAmount: number;
  ticketCount: number;
  scannedTicketCount: number;
  canPartialRefund: boolean;
  refundableAmount: number;
  refundPolicy: RefundPolicy;
}

export interface RefundPolicy {
  allowRefunds: boolean;
  cutoffHours: number;
  refundPercentage: number;
  allowPartialRefunds: boolean;
  requiresApproval: boolean;
}

export interface RefundResult {
  orderId: string;
  refundId: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  processedAt: string;
  inventoryRestored: boolean;
  waitlistNotified: boolean;
}

export class RefundService {
  private supabase: Awaited<ReturnType<typeof createClient>>;
  
  // Default refund policy
  private readonly DEFAULT_POLICY: RefundPolicy = {
    allowRefunds: true,
    cutoffHours: 24, // 24 hours before event
    refundPercentage: 100,
    allowPartialRefunds: true,
    requiresApproval: false,
  };

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  /**
   * Check refund eligibility for an order
   */
  async checkRefundEligibility(orderId: string, userId: string): Promise<RefundEligibility> {
    // Get order details
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select(`
        *,
        tickets:tickets (
          id,
          status,
          scanned_at,
          ticket_type_id
        ),
        events:event_id (
          id,
          title,
          start_date,
          status,
          refund_policy
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw ErrorResponses.notFound('Order not found');
    }

    // Check ownership
    if (order.user_id !== userId) {
      throw ErrorResponses.forbidden('Access denied');
    }

    const isRefunded = order.status === 'refunded';
    const isCancelled = order.status === 'cancelled';
    const isCompleted = order.status === 'completed';
    const scannedTickets = order.tickets.filter((t: any) => t.scanned_at);
    const hasScannedTickets = scannedTickets.length > 0;
    const totalAmount = parseFloat(order.total_amount);

    // Get event-specific refund policy
    const eventData = Array.isArray(order.events) ? order.events[0] : order.events;
    const refundPolicy = eventData?.refund_policy || this.DEFAULT_POLICY;

    // Check time-based eligibility
    let timeEligible = true;
    let timeReason = '';
    
    if (eventData?.start_date) {
      const eventStart = new Date(eventData.start_date);
      const now = new Date();
      const hoursUntilEvent = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilEvent < refundPolicy.cutoffHours) {
        timeEligible = false;
        timeReason = `Refund cutoff is ${refundPolicy.cutoffHours} hours before event`;
      }
    }

    // Determine eligibility
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
    } else if (!refundPolicy.allowRefunds) {
      reason = 'Refunds not allowed for this event';
    } else if (!timeEligible) {
      reason = timeReason;
    } else {
      eligible = true;
      reason = 'Order is eligible for refund';
    }

    const refundableAmount = eligible 
      ? Math.round(totalAmount * 100 * (refundPolicy.refundPercentage / 100))
      : 0;

    return {
      eligible,
      reason,
      orderStatus: order.status,
      totalAmount,
      ticketCount: order.tickets.length,
      scannedTicketCount: scannedTickets.length,
      canPartialRefund: eligible && refundPolicy.allowPartialRefunds && !hasScannedTickets,
      refundableAmount,
      refundPolicy,
    };
  }

  /**
   * Process refund for an order
   */
  async processRefund(request: RefundRequest): Promise<RefundResult> {
    const { orderId, userId, reason, amount, notes, processedBy } = request;

    // Check eligibility
    const eligibility = await this.checkRefundEligibility(orderId, userId);
    
    if (!eligibility.eligible) {
      throw ErrorResponses.badRequest(`Refund not allowed: ${eligibility.reason}`);
    }

    // Get order details
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select(`
        *,
        tickets:tickets (
          id,
          ticket_type_id,
          status
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw ErrorResponses.notFound('Order not found');
    }

    // Calculate refund amount
    const refundAmount = amount || eligibility.refundableAmount;

    if (amount && amount > eligibility.refundableAmount) {
      throw ErrorResponses.badRequest(
        `Refund amount cannot exceed ${eligibility.refundableAmount / 100}`
      );
    }

    // Process refund through Stripe
    let refund: Stripe.Refund;
    try {
      const stripeReason = reason === 'event_cancelled' ? 'requested_by_customer' : 
                          (reason === 'other' ? undefined : reason);
      
      refund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: refundAmount,
        reason: stripeReason as Stripe.RefundCreateParams.Reason | undefined,
        metadata: {
          order_id: order.id,
          processed_by: processedBy,
          notes: notes || '',
          original_reason: reason,
        },
      });
    } catch (stripeError: any) {
      throw ErrorResponses.paymentFailed(
        `Refund failed: ${stripeError.message || 'Unknown error'}`
      );
    }

    // Update order status
    await this.supabase
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
          refunded_by: processedBy,
        },
      })
      .eq('id', orderId);

    // Update tickets
    await this.supabase
      .from('tickets')
      .update({
        status: 'refunded',
        metadata: {
          refunded_at: new Date().toISOString(),
          refund_id: refund.id,
        },
      })
      .eq('order_id', orderId);

    // Restore inventory
    const inventoryRestored = await this.restoreInventory(order.tickets);

    // Notify waitlist
    const waitlistNotified = await this.notifyWaitlist(order.tickets);

    // Create audit log
    await this.supabase
      .from('audit_logs')
      .insert({
        table_name: 'orders',
        record_id: orderId,
        action: 'UPDATE',
        old_values: { status: order.status },
        new_values: { status: 'refunded', refund_id: refund.id },
        changed_fields: ['status'],
        user_id: processedBy,
        metadata: { reason, amount: refundAmount, notes },
      });

    // Send notification to customer
    await this.supabase
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

    return {
      orderId: order.id,
      refundId: refund.id,
      amount: refundAmount / 100,
      currency: refund.currency,
      status: refund.status || 'unknown',
      reason,
      processedAt: new Date().toISOString(),
      inventoryRestored,
      waitlistNotified,
    };
  }

  /**
   * Restore inventory after refund
   */
  private async restoreInventory(tickets: any[]): Promise<boolean> {
    try {
      const ticketTypeCounts: Record<string, number> = {};
      
      tickets.forEach((ticket: any) => {
        ticketTypeCounts[ticket.ticket_type_id] = 
          (ticketTypeCounts[ticket.ticket_type_id] || 0) + 1;
      });

      for (const [ticketTypeId, count] of Object.entries(ticketTypeCounts)) {
        await this.supabase.rpc('decrement_tickets_sold', {
          p_ticket_type_id: ticketTypeId,
          p_quantity: count,
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to restore inventory:', error);
      return false;
    }
  }

  /**
   * Notify waitlist after refund
   */
  private async notifyWaitlist(tickets: any[]): Promise<boolean> {
    try {
      if (tickets.length === 0) return false;

      const firstTicket = tickets[0];
      
      // Get event ID from ticket
      const { data: ticketType } = await this.supabase
        .from('ticket_types')
        .select('event_id')
        .eq('id', firstTicket.ticket_type_id)
        .single();

      if (!ticketType) return false;

      // Trigger waitlist notification
      await this.supabase.rpc('notify_waitlist', {
        p_event_id: ticketType.event_id,
        p_ticket_type_id: firstTicket.ticket_type_id,
        p_quantity: tickets.length,
      });

      return true;
    } catch (error) {
      console.error('Failed to notify waitlist:', error);
      return false;
    }
  }

  /**
   * Batch process refunds (for event cancellation)
   */
  async batchProcessRefunds(
    orderIds: string[],
    reason: string,
    processedBy: string
  ): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ orderId: string; error: string }>;
  }> {
    let successful = 0;
    let failed = 0;
    const errors: Array<{ orderId: string; error: string }> = [];

    for (const orderId of orderIds) {
      try {
        // Get order to find user
        const { data: order } = await this.supabase
          .from('orders')
          .select('user_id')
          .eq('id', orderId)
          .single();

        if (!order) {
          failed++;
          errors.push({ orderId, error: 'Order not found' });
          continue;
        }

        await this.processRefund({
          orderId,
          userId: order.user_id,
          reason: reason as any,
          processedBy,
        });

        successful++;
      } catch (error: any) {
        failed++;
        errors.push({ orderId, error: error.message });
      }
    }

    return { successful, failed, errors };
  }

  /**
   * Get refund history for a user
   */
  async getRefundHistory(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        metadata,
        events:event_id (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'refunded')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch refund history', error);
    }

    return data || [];
  }

  /**
   * Calculate refund statistics for an event
   */
  async getEventRefundStats(eventId: string): Promise<{
    totalRefunds: number;
    totalRefundAmount: number;
    refundRate: number;
    refundsByReason: Record<string, number>;
  }> {
    const { data: orders, error } = await this.supabase
      .from('orders')
      .select('total_amount, metadata')
      .eq('event_id', eventId);

    if (error) {
      throw ErrorResponses.databaseError('Failed to fetch refund stats', error);
    }

    const allOrders = orders || [];
    const refundedOrders = allOrders.filter(o => o.metadata?.refund_id);
    
    const totalRefunds = refundedOrders.length;
    const totalRefundAmount = refundedOrders.reduce(
      (sum, o) => sum + (o.metadata?.refund_amount || 0),
      0
    ) / 100;
    
    const refundRate = allOrders.length > 0 
      ? (totalRefunds / allOrders.length) * 100 
      : 0;

    const refundsByReason: Record<string, number> = {};
    refundedOrders.forEach(o => {
      const reason = o.metadata?.refund_reason || 'unknown';
      refundsByReason[reason] = (refundsByReason[reason] || 0) + 1;
    });

    return {
      totalRefunds,
      totalRefundAmount,
      refundRate: Math.round(refundRate * 10) / 10,
      refundsByReason,
    };
  }
}
