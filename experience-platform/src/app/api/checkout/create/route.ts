import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate all items and check availability
    const validatedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (item.type === 'ticket') {
        // Validate ticket
        const { data: ticketType } = await supabase
          .from('ticket_types')
          .select('*, events(*)')
          .eq('id', item.ticketTypeId || item.id)
          .single();

        if (!ticketType) {
          return NextResponse.json(
            { error: `Ticket type not found: ${item.name}` },
            { status: 404 }
          );
        }

        const available = ticketType.quantity_available - ticketType.quantity_sold;
        if (available < item.quantity) {
          return NextResponse.json(
            { error: `Not enough tickets available for ${item.name}` },
            { status: 400 }
          );
        }

        validatedItems.push({
          ...item,
          ticketType,
          event: ticketType.events,
        });

        totalAmount += ticketType.price * item.quantity;
      } else if (item.type === 'product') {
        // Validate product
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productId || item.id)
          .single();

        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${item.name}` },
            { status: 404 }
          );
        }

        validatedItems.push({
          ...item,
          product,
        });

        totalAmount += product.base_price * item.quantity;
      }
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        event_id: validatedItems.find(i => i.type === 'ticket')?.event?.id,
        total_amount: totalAmount,
        status: 'pending',
        order_items: validatedItems.map(item => ({
          type: item.type,
          ticket_type_id: item.ticketTypeId || item.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create tickets for ticket items
    const ticketItems = validatedItems.filter(i => i.type === 'ticket');
    for (const item of ticketItems) {
      const ticketsToCreate = Array.from({ length: item.quantity }, () => ({
        order_id: order.id,
        ticket_type_id: item.ticketTypeId || item.id,
        status: 'pending', // Will be activated after payment
      }));

      await supabase.from('tickets').insert(ticketsToCreate);
    }

    // Create Stripe checkout session
    const lineItems = validatedItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.type === 'ticket' 
            ? `${item.event?.name} - ${item.ticketType?.name}`
            : item.product?.description,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=true`,
      customer_email: user.email,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      orderId: order.id,
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
