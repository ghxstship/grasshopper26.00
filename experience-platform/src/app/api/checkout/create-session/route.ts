import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Calculate total
    const amount = items.reduce(
      (sum: number, item: any) => sum + (item.price * item.quantity),
      0
    );

    // Add service fee (5%)
    const totalAmount = Math.round(amount * 1.05 * 100); // Convert to cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
        itemCount: items.length.toString(),
      },
    });

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: (totalAmount / 100).toString(),
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create ticket records for ticket items
    for (const item of items) {
      if (item.type === 'ticket') {
        await supabase.from('tickets').insert({
          order_id: order.id,
          ticket_type_id: item.ticketTypeId,
          status: 'pending',
          qr_code: `TEMP-${order.id}-${item.id}`, // Will be updated after payment
        });
      }
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
