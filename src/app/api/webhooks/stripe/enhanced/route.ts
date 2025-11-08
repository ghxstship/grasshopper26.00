import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/lib/services/order.service';
import { NotificationService } from '@/lib/services/notification.service';
import { handleAPIError } from '@/lib/api/error-handler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const orderService = new OrderService(supabase);
    const notificationService = new NotificationService(supabase);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent, orderService, notificationService);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, orderService, notificationService);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge, orderService, notificationService);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event, supabase);
        break;

      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session, orderService, notificationService);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePayment(event.data.object as Stripe.Invoice, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return handleAPIError(error);
  }
}

async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  orderService: OrderService,
  notificationService: NotificationService
) {
  try {
    // Find order by payment intent ID
    const supabase = await createClient();
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (!order) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }

    // Complete the order
    await orderService.completeOrder(order.id, paymentIntent.id);

    // Send confirmation email
    await notificationService.sendOrderConfirmation(order.id);

    console.log(`Payment succeeded for order ${order.id}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  orderService: OrderService,
  notificationService: NotificationService
) {
  try {
    const supabase = await createClient();
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (!order) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }

    // Update order status to failed
    await orderService.updateOrderStatus(order.id, 'failed');

    // Create notification
    await notificationService.createNotification({
      user_id: order.user_id,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      metadata: { orderId: order.id, paymentIntentId: paymentIntent.id },
    });

    console.log(`Payment failed for order ${order.id}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

async function handleRefund(
  charge: Stripe.Charge,
  orderService: OrderService,
  notificationService: NotificationService
) {
  try {
    const supabase = await createClient();
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, event_id')
      .eq('stripe_payment_intent_id', charge.payment_intent)
      .single();

    if (!order) {
      console.error('Order not found for charge:', charge.id);
      return;
    }

    // Update order status to refunded
    await orderService.updateOrderStatus(order.id, 'refunded');

    // Get ticket type IDs and quantities to restore inventory
    const { data: tickets } = await supabase
      .from('tickets')
      .select('ticket_type_id')
      .eq('order_id', order.id);

    if (tickets) {
      // Restore inventory for each ticket type
      const ticketTypeCounts = tickets.reduce((acc: any, ticket) => {
        acc[ticket.ticket_type_id] = (acc[ticket.ticket_type_id] || 0) + 1;
        return acc;
      }, {});

      for (const [ticketTypeId, count] of Object.entries(ticketTypeCounts)) {
        await orderService.decrementTicketsSold(ticketTypeId, count as number);
      }
    }

    // Notify waitlist if applicable
    if (order.event_id) {
      await notificationService.notifyWaitlistAvailability(order.event_id, tickets?.[0]?.ticket_type_id);
    }

    // Create notification
    await notificationService.createNotification({
      user_id: order.user_id,
      type: 'order_refunded',
      title: 'Order Refunded',
      message: 'Your order has been refunded.',
      metadata: { orderId: order.id },
    });

    console.log(`Refund processed for order ${order.id}`);
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

async function handleSubscriptionChange(event: Stripe.Event, supabase: any) {
  const subscription = event.data.object as Stripe.Subscription;
  
  // Update subscription status in database
  await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      user_id: subscription.metadata.userId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });

  console.log(`Subscription ${event.type} for ${subscription.id}`);
}

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  orderService: OrderService,
  notificationService: NotificationService
) {
  if (session.payment_intent) {
    // Handle as regular payment
    await handlePaymentSuccess(
      { id: session.payment_intent as string } as Stripe.PaymentIntent,
      orderService,
      notificationService
    );
  }
}

async function handleInvoicePayment(invoice: Stripe.Invoice, supabase: any) {
  // Update invoice payment status
  await supabase
    .from('invoices')
    .upsert({
      stripe_invoice_id: invoice.id,
      user_id: invoice.metadata?.userId,
      status: invoice.status,
      amount_paid: invoice.amount_paid,
      paid_at: invoice.status_transitions.paid_at 
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
        : null,
    });

  console.log(`Invoice payment succeeded for ${invoice.id}`);
}
