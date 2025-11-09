export type MembershipTierSlug =
  | 'community'
  | 'basic'
  | 'main'
  | 'extra'
  | 'business'
  | 'first_class'

export type MembershipStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'suspended'

export type BillingCycle = 'annual' | 'monthly' | 'lifetime'

export type TransitionType =
  | 'upgrade'
  | 'downgrade'
  | 'renewal'
  | 'cancellation'

export interface MembershipTier {
  id: string
  tier_name: string
  tier_slug: MembershipTierSlug
  display_name: string
  tier_level: number
  annual_price: number
  monthly_price: number | null
  stripe_annual_price_id: string | null
  stripe_monthly_price_id: string | null
  stripe_product_id: string | null
  badge_icon: string
  badge_color: string
  benefits: Record<string, any>
  limits: {
    can_purchase_tickets?: boolean
    ticket_discount?: number
    early_access_hours?: number
    credits_per_quarter?: number
    vip_upgrades_per_year?: number
    merchandise_discount?: number
    guests_allowed?: number
    credits_per_seat_per_quarter?: number
    min_seats?: number
    vip_credits_per_quarter?: number
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserMembership {
  id: string
  user_id: string
  tier_id: string
  status: MembershipStatus
  billing_cycle: BillingCycle | null
  start_date: string
  renewal_date: string | null
  cancellation_date: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  auto_renew: boolean
  ticket_credits_remaining: number
  ticket_credits_total: number
  vip_upgrades_remaining: number
  vip_upgrades_total: number
  events_attended: number
  last_benefit_used_at: string | null
  lifetime_value: number
  parent_membership_id: string | null
  is_primary_account: boolean
  seat_allocation: number | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  membership_tiers?: MembershipTier
}

export interface MembershipBenefitUsage {
  id: string
  membership_id: string
  benefit_type: string
  event_id: string | null
  order_id: string | null
  used_at: string
  value_redeemed: number | null
  notes: string | null
  created_at: string
}

export interface MembershipTransition {
  id: string
  user_id: string
  from_tier_id: string | null
  to_tier_id: string | null
  transition_type: TransitionType
  reason: string | null
  effective_date: string
  prorated_amount: number | null
  created_at: string
}

export interface TicketCreditLedger {
  id: string
  membership_id: string
  transaction_type: 'allocation' | 'redemption' | 'expiration' | 'bonus'
  credits_change: number
  credits_balance: number
  related_order_id: string | null
  expires_at: string | null
  notes: string | null
  created_at: string
}

export interface VipUpgradeVoucher {
  id: string
  membership_id: string
  voucher_code: string
  status: 'available' | 'redeemed' | 'expired'
  event_id: string | null
  redeemed_at: string | null
  expires_at: string
  created_at: string
}

export interface MemberEvent {
  id: string
  event_id: string
  min_tier_level: number
  max_capacity: number | null
  current_registrations: number
  registration_opens_at: string | null
  registration_closes_at: string | null
  event_type: string | null
  lottery_based: boolean
  created_at: string
}

export interface MemberEventRegistration {
  id: string
  member_event_id: string
  user_id: string
  membership_id: string | null
  status: 'registered' | 'confirmed' | 'waitlist' | 'cancelled'
  guests: number
  lottery_entry: boolean
  lottery_won: boolean | null
  checked_in_at: string | null
  created_at: string
}

export interface MembershipReferral {
  id: string
  referrer_user_id: string | null
  referrer_membership_id: string | null
  referred_user_id: string | null
  referral_code: string
  status: 'pending' | 'completed' | 'credited'
  reward_amount: number | null
  reward_credited_at: string | null
  created_at: string
}

export interface BusinessTeamMember {
  id: string
  business_membership_id: string
  member_user_id: string
  role: 'admin' | 'manager' | 'member'
  ticket_allocation: number
  can_approve_tickets: boolean
  status: 'active' | 'inactive' | 'pending'
  invited_by: string | null
  invited_at: string | null
  joined_at: string | null
  removed_at: string | null
  created_at: string
}

// Helper types for UI components
export interface TierComparisonData {
  tier: MembershipTier
  isCurrentTier: boolean
  isRecommended: boolean
  isBestValue: boolean
  savings: number
  breakEvenEvents: number
}

export interface MembershipDashboardStats {
  eventsAttended: number
  creditsRemaining: number
  lifetimeSavings: number
  nextBenefit: string | null
  tierProgress: number
}

export interface UpgradePromptData {
  trigger: string
  message: string
  cta: string
  benefitHighlight: string
  discountOffer?: string
  comparisonValue?: number
}
