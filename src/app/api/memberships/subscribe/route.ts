import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  try {
    const { userId, tierId, billingCycle, promoCode, successUrl, cancelUrl } =
      await req.json()

    if (!userId || !tierId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get tier details
    const { data: tier, error: tierError} = await supabase
      .from('membership_tiers')
      .select('*')
      .eq('id', tierId)
      .single()

    if (tierError || !tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    // Check for existing active membership
    const { data: existingMembership } = await supabase
      .from('user_memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User already has an active membership' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        metadata: {
          user_id: userId,
        },
      })
      customerId = customer.id

      // Save customer ID
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Determine price ID
    const priceId =
      billingCycle === 'annual'
        ? tier.stripe_annual_price_id
        : tier.stripe_monthly_price_id

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this tier' },
        { status: 400 }
      )
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/portal?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/membership`,
      subscription_data: {
        metadata: {
          user_id: userId,
          tier_id: tierId,
        },
      },
      metadata: {
        user_id: userId,
        tier_id: tierId,
      },
    }

    // Apply promo code if provided
    if (promoCode) {
      const { data: promoCodes } = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      })

      if (promoCodes.length > 0) {
        sessionParams.discounts = [
          {
            promotion_code: promoCodes[0].id,
          },
        ]
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
