import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentIntentId } = await request.json();

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Update order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq('stripe_payment_intent_id', paymentIntentId)
      .select()
      .single();

    if (orderError) throw orderError;

    // Update ticket status and generate QR codes
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('order_id', order.id);

    if (tickets) {
      for (const ticket of tickets) {
        const qrCode = `TICKET-${ticket.id}-${Date.now()}`;
        
        await supabase
          .from('tickets')
          .update({
            status: 'active',
            qr_code: qrCode,
          })
          .eq('id', ticket.id);
      }
    }

    // TODO: Send confirmation email
    // await sendOrderConfirmationEmail(order, user);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
