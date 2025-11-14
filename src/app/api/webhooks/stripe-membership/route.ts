import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/design-system/utils/logger-helpers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_MEMBERSHIP_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    logger.error('Webhook signature verification failed', err, { context: 'stripe-membership-webhook' })
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
          supabase
        )
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          supabase
        )
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          supabase
        )
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(
          event.data.object as Stripe.Invoice,
          supabase
        )
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(
          event.data.object as Stripe.Invoice,
          supabase
        )
        break

      default:
        logger.info('Unhandled event type', { eventType: event.type, context: 'stripe-membership-webhook' })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Webhook handler error', error as Error, { context: 'stripe-membership-webhook' })
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const { metadata } = subscription
  const tierId = metadata.tier_id
  const userId = metadata.user_id

  if (!tierId || !userId) {
    throw new Error('Missing tier_id or user_id in subscription metadata')
  }

  // Get tier details
  const { data: tier } = await supabase
    .from('membership_tiers')
    .select('*')
    .eq('id', tierId)
    .single()

  if (!tier) {
    throw new Error(`Tier not found: ${tierId}`)
  }

  // Create membership record
  const { data: membership, error: membershipError } = await supabase
    .from('user_memberships')
    .insert({
      user_id: userId,
      tier_id: tierId,
      status: 'active',
      billing_cycle:
        subscription.items.data[0].price.recurring?.interval === 'year'
          ? 'annual'
          : 'monthly',
      start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      auto_renew: true,
    })
    .select()
    .single()

  if (membershipError) {
    throw new Error(`Failed to create membership: ${membershipError.message}`)
  }

  // Allocate initial credits based on tier
  await allocateCredits(membership.id, tier, supabase)

  // Record transition
  await supabase.from('membership_transitions').insert({
    user_id: userId,
    to_tier_id: tierId,
    transition_type: 'upgrade',
    effective_date: new Date().toISOString(),
  })

  logger.info('Membership created', { userId, tierName: tier.tier_name, context: 'stripe-membership-webhook' })
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!membership) {
    logger.warn('Membership not found for subscription in update', { subscriptionId: subscription.id, context: 'stripe-membership-webhook' })
    return
  }

  // Update membership status
  const status =
    subscription.status === 'active'
      ? 'active'
      : subscription.status === 'canceled'
        ? 'cancelled'
        : subscription.status === 'past_due'
          ? 'suspended'
          : 'expired'

  await supabase
    .from('user_memberships')
    .update({
      status,
      renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
      auto_renew: !subscription.cancel_at_period_end,
      cancellation_date: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('id', membership.id)

  logger.info('Membership updated', { membershipId: membership.id, status, context: 'stripe-membership-webhook' })
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!membership) {
    logger.warn('Membership not found for subscription in delete', { subscriptionId: subscription.id, context: 'stripe-membership-webhook' })
    return
  }

  await supabase
    .from('user_memberships')
    .update({
      status: 'cancelled',
      cancellation_date: new Date().toISOString(),
      auto_renew: false,
    })
    .eq('id', membership.id)

  // Record transition
  await supabase.from('membership_transitions').insert({
    user_id: membership.user_id,
    from_tier_id: membership.tier_id,
    transition_type: 'cancellation',
    effective_date: new Date().toISOString(),
  })

  logger.info('Membership cancelled', { membershipId: membership.id, context: 'stripe-membership-webhook' })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  if (!invoice.subscription) return

  const { data: membership } = await supabase
    .from('user_memberships')
    .select('*, membership_tiers(*)')
    .eq('stripe_subscription_id', invoice.subscription)
    .single()

  if (!membership) return

  // Update lifetime value
  const amount = invoice.amount_paid / 100
  await supabase
    .from('user_memberships')
    .update({
      lifetime_value: (membership.lifetime_value || 0) + amount,
    })
    .eq('id', membership.id)

  // Allocate quarterly credits if it's a renewal
  const tier = membership.membership_tiers
  if (tier && tier.limits?.credits_per_quarter) {
    await allocateCredits(membership.id, tier, supabase)
  }

  logger.info('Payment succeeded for membership', { membershipId: membership.id, amount, context: 'stripe-membership-webhook' })
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  if (!invoice.subscription) return

  const { data: membership } = await supabase
    .from('user_memberships')
    .select('*')
    .eq('stripe_subscription_id', invoice.subscription)
    .single()

  if (!membership) return

  // Update status to suspended
  await supabase
    .from('user_memberships')
    .update({
      status: 'suspended',
    })
    .eq('id', membership.id)

  logger.warn('Payment failed for membership', { membershipId: membership.id, context: 'stripe-membership-webhook' })
}

async function allocateCredits(
  membershipId: string,
  tier: any,
  supabase: any
) {
  const creditsToAllocate = tier.limits?.credits_per_quarter || 0
  const vipUpgrades = tier.limits?.vip_upgrades_per_year || 0

  if (creditsToAllocate > 0) {
    // Get current balance
    const { data: currentMembership } = await supabase
      .from('user_memberships')
      .select('ticket_credits_remaining')
      .eq('id', membershipId)
      .single()

    const newBalance =
      (currentMembership?.ticket_credits_remaining || 0) + creditsToAllocate

    // Add to ledger
    await supabase.from('ticket_credits_ledger').insert({
      membership_id: membershipId,
      transaction_type: 'allocation',
      credits_change: creditsToAllocate,
      credits_balance: newBalance,
      notes: 'Quarterly credit allocation',
      expires_at: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year
    })

    // Update membership
    await supabase
      .from('user_memberships')
      .update({
        ticket_credits_remaining: newBalance,
        ticket_credits_total:
          (currentMembership?.ticket_credits_total || 0) + creditsToAllocate,
      })
      .eq('id', membershipId)
  }

  // Generate VIP upgrade vouchers if applicable
  if (vipUpgrades > 0) {
    const vouchers = Array.from({ length: vipUpgrades }, () => ({
      membership_id: membershipId,
      voucher_code: generateVoucherCode(),
      status: 'available',
      expires_at: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }))

    await supabase.from('vip_upgrade_vouchers').insert(vouchers)

    // Update membership
    await supabase
      .from('user_memberships')
      .update({
        vip_upgrades_remaining: vipUpgrades,
        vip_upgrades_total: vipUpgrades,
      })
      .eq('id', membershipId)
  }
}

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
