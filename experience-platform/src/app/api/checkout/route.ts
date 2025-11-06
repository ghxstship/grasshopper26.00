import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { eventId, ticketTypeId, quantity } = await req.json()

    const supabase = await createClient()

    // Get ticket type details
    const { data: ticketType, error: ticketError } = await supabase
      .from('ticket_types')
      .select('*, events(*)')
      .eq('id', ticketTypeId)
      .single()

    if (ticketError || !ticketType) {
      return NextResponse.json(
        { error: 'Ticket type not found' },
        { status: 404 }
      )
    }

    // Check availability
    const available = (ticketType.quantity_available || 0) - ticketType.quantity_sold
    if (available < quantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        event_id: eventId,
        total_amount: ticketType.price * quantity,
        status: 'pending',
        order_items: [
          {
            ticket_type_id: ticketTypeId,
            quantity,
            price: ticketType.price,
          },
        ],
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create tickets
    const ticketsToCreate = Array.from({ length: quantity }, () => ({
      order_id: order.id,
      ticket_type_id: ticketTypeId,
      status: 'active',
    }))

    await supabase.from('tickets').insert(ticketsToCreate)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${ticketType.events.name} - ${ticketType.name}`,
              description: ticketType.description || undefined,
            },
            unit_amount: Math.round(ticketType.price * 100),
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${ticketType.events.slug}?canceled=true`,
      metadata: {
        order_id: order.id,
        event_id: eventId,
        user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, orderId: order.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
