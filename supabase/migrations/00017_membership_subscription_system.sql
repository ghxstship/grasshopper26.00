-- Membership Subscription System
-- Airline-inspired tier structure with recurring revenue model
-- Date: January 9, 2025

-- Membership tiers configuration
CREATE TABLE IF NOT EXISTS membership_tiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name text NOT NULL UNIQUE, -- community, basic, main, extra, business, first_class
  tier_slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  tier_level integer NOT NULL, -- 0-5 for hierarchy
  annual_price decimal(10,2) NOT NULL DEFAULT 0,
  monthly_price decimal(10,2),
  stripe_annual_price_id text,
  stripe_monthly_price_id text,
  stripe_product_id text,
  badge_icon text, -- geometric shape identifier
  badge_color text, -- hex color for tier
  benefits jsonb NOT NULL DEFAULT '{}', -- structured benefits list
  limits jsonb NOT NULL DEFAULT '{}', -- ticket credits, discounts, etc.
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User memberships
CREATE TABLE IF NOT EXISTS user_memberships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES membership_tiers(id),
  status text NOT NULL DEFAULT 'active', -- active, cancelled, expired, suspended
  billing_cycle text, -- annual, monthly, lifetime
  start_date timestamptz NOT NULL DEFAULT now(),
  renewal_date timestamptz,
  cancellation_date timestamptz,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  auto_renew boolean DEFAULT true,
  
  -- Credits and allocations
  ticket_credits_remaining integer DEFAULT 0,
  ticket_credits_total integer DEFAULT 0,
  vip_upgrades_remaining integer DEFAULT 0,
  vip_upgrades_total integer DEFAULT 0,
  
  -- Usage tracking
  events_attended integer DEFAULT 0,
  last_benefit_used_at timestamptz,
  lifetime_value decimal(10,2) DEFAULT 0,
  
  -- Business tier specific
  parent_membership_id uuid REFERENCES user_memberships(id), -- for business sub-accounts
  is_primary_account boolean DEFAULT true,
  seat_allocation integer, -- for business tier
  
  metadata jsonb DEFAULT '{}', -- flexible storage for tier-specific data
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, tier_id, status)
);

-- Membership benefits usage tracking
CREATE TABLE IF NOT EXISTS membership_benefit_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id uuid REFERENCES user_memberships(id) ON DELETE CASCADE,
  benefit_type text NOT NULL, -- ticket_credit, vip_upgrade, early_access, etc.
  event_id uuid REFERENCES events(id),
  order_id uuid REFERENCES orders(id),
  used_at timestamptz NOT NULL DEFAULT now(),
  value_redeemed decimal(10,2), -- dollar value of benefit
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Membership tier transitions (upgrade/downgrade history)
CREATE TABLE IF NOT EXISTS membership_transitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  from_tier_id uuid REFERENCES membership_tiers(id),
  to_tier_id uuid REFERENCES membership_tiers(id),
  transition_type text, -- upgrade, downgrade, renewal, cancellation
  reason text,
  effective_date timestamptz NOT NULL DEFAULT now(),
  prorated_amount decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Business team management
CREATE TABLE IF NOT EXISTS business_team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_membership_id uuid REFERENCES user_memberships(id) ON DELETE CASCADE,
  member_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member', -- admin, manager, member
  ticket_allocation integer DEFAULT 0, -- tickets allocated to this member
  can_approve_tickets boolean DEFAULT false,
  status text DEFAULT 'active', -- active, inactive, pending
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz,
  joined_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_membership_id, member_user_id)
);

-- Ticket credits ledger
CREATE TABLE IF NOT EXISTS ticket_credits_ledger (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id uuid REFERENCES user_memberships(id) ON DELETE CASCADE,
  transaction_type text NOT NULL, -- allocation, redemption, expiration, bonus
  credits_change integer NOT NULL, -- positive for credits added, negative for used
  credits_balance integer NOT NULL,
  related_order_id uuid REFERENCES orders(id),
  expires_at timestamptz, -- credit expiration date
  notes text,
  created_at timestamptz DEFAULT now()
);

-- VIP upgrade vouchers
CREATE TABLE IF NOT EXISTS vip_upgrade_vouchers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id uuid REFERENCES user_memberships(id) ON DELETE CASCADE,
  voucher_code text UNIQUE NOT NULL,
  status text DEFAULT 'available', -- available, redeemed, expired
  event_id uuid REFERENCES events(id), -- null if not yet assigned
  redeemed_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Member-only events
CREATE TABLE IF NOT EXISTS member_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  min_tier_level integer NOT NULL, -- minimum tier level required
  max_capacity integer,
  current_registrations integer DEFAULT 0,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  event_type text, -- meet_greet, listening_party, exclusive_show, etc.
  lottery_based boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Member event registrations
CREATE TABLE IF NOT EXISTS member_event_registrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_event_id uuid REFERENCES member_events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES user_memberships(id),
  status text DEFAULT 'registered', -- registered, confirmed, waitlist, cancelled
  guests integer DEFAULT 0, -- number of +1s
  lottery_entry boolean DEFAULT false,
  lottery_won boolean,
  checked_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(member_event_id, user_id)
);

-- Referral program tracking
CREATE TABLE IF NOT EXISTS membership_referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id uuid REFERENCES auth.users(id),
  referrer_membership_id uuid REFERENCES user_memberships(id),
  referred_user_id uuid REFERENCES auth.users(id),
  referral_code text UNIQUE NOT NULL,
  status text DEFAULT 'pending', -- pending, completed, credited
  reward_amount decimal(10,2),
  reward_credited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_tier ON user_memberships(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_sub ON user_memberships(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_benefit_usage_membership ON membership_benefit_usage(membership_id);
CREATE INDEX IF NOT EXISTS idx_benefit_usage_event ON membership_benefit_usage(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_credits_membership ON ticket_credits_ledger(membership_id);
CREATE INDEX IF NOT EXISTS idx_ticket_credits_expires ON ticket_credits_ledger(expires_at);
CREATE INDEX IF NOT EXISTS idx_business_team_business ON business_team_members(business_membership_id);
CREATE INDEX IF NOT EXISTS idx_business_team_member ON business_team_members(member_user_id);
CREATE INDEX IF NOT EXISTS idx_vip_vouchers_membership ON vip_upgrade_vouchers(membership_id);
CREATE INDEX IF NOT EXISTS idx_vip_vouchers_status ON vip_upgrade_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_member_events_event ON member_events(event_id);
CREATE INDEX IF NOT EXISTS idx_member_event_regs_event ON member_event_registrations(member_event_id);
CREATE INDEX IF NOT EXISTS idx_member_event_regs_user ON member_event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON membership_referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON membership_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON membership_referrals(referral_code);

-- Enable RLS
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_benefit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_credits_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_upgrade_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Membership tiers are public (read-only)
DROP POLICY IF EXISTS "Anyone can view active membership tiers" ON membership_tiers;
CREATE POLICY "Anyone can view active membership tiers" ON membership_tiers
  FOR SELECT USING (is_active = true);

-- Users can view their own memberships
DROP POLICY IF EXISTS "Users can view their own memberships" ON user_memberships;
CREATE POLICY "Users can view their own memberships" ON user_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own benefit usage
DROP POLICY IF EXISTS "Users can view their own benefit usage" ON membership_benefit_usage;
CREATE POLICY "Users can view their own benefit usage" ON membership_benefit_usage
  FOR SELECT USING (
    membership_id IN (
      SELECT id FROM user_memberships WHERE user_id = auth.uid()
    )
  );

-- Users can view their own transitions
DROP POLICY IF EXISTS "Users can view their own transitions" ON membership_transitions;
CREATE POLICY "Users can view their own transitions" ON membership_transitions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own credits
DROP POLICY IF EXISTS "Users can view their own credits" ON ticket_credits_ledger;
CREATE POLICY "Users can view their own credits" ON ticket_credits_ledger
  FOR SELECT USING (
    membership_id IN (
      SELECT id FROM user_memberships WHERE user_id = auth.uid()
    )
  );

-- Users can view their own vouchers
DROP POLICY IF EXISTS "Users can view their own vouchers" ON vip_upgrade_vouchers;
CREATE POLICY "Users can view their own vouchers" ON vip_upgrade_vouchers
  FOR SELECT USING (
    membership_id IN (
      SELECT id FROM user_memberships WHERE user_id = auth.uid()
    )
  );

-- Users can view member events for their tier
DROP POLICY IF EXISTS "Users can view member events for their tier" ON member_events;
CREATE POLICY "Users can view member events for their tier" ON member_events
  FOR SELECT USING (
    min_tier_level <= (
      SELECT mt.tier_level
      FROM user_memberships um
      JOIN membership_tiers mt ON um.tier_id = mt.id
      WHERE um.user_id = auth.uid() AND um.status = 'active'
      ORDER BY mt.tier_level DESC
      LIMIT 1
    )
  );

-- Users can view their own event registrations
DROP POLICY IF EXISTS "Users can view their own event registrations" ON member_event_registrations;
CREATE POLICY "Users can view their own event registrations" ON member_event_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own event registrations
DROP POLICY IF EXISTS "Users can create their own event registrations" ON member_event_registrations;
CREATE POLICY "Users can create their own event registrations" ON member_event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own referrals
DROP POLICY IF EXISTS "Users can view their own referrals" ON membership_referrals;
CREATE POLICY "Users can view their own referrals" ON membership_referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_membership_tiers_updated_at ON membership_tiers;
CREATE TRIGGER update_membership_tiers_updated_at
  BEFORE UPDATE ON membership_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_memberships_updated_at ON user_memberships;
CREATE TRIGGER update_user_memberships_updated_at
  BEFORE UPDATE ON user_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial membership tiers
INSERT INTO membership_tiers (tier_name, tier_slug, display_name, tier_level, annual_price, monthly_price, badge_icon, badge_color, benefits, limits) VALUES
('community', 'community', 'Community', 0, 0, 0, 'circle', '#9CA3AF', 
  '{"browse_events": true, "view_artists": true, "email_newsletter": true, "save_favorites": true, "basic_notifications": true}'::jsonb,
  '{"can_purchase_tickets": false, "ticket_discount": 0, "early_access_hours": 0}'::jsonb
),
('basic', 'basic', 'Basic', 1, 29.00, 2.99, 'square', '#4B5563',
  '{"all_community": true, "purchase_tickets": true, "member_presales": true, "digital_card": true, "birthday_discount": true}'::jsonb,
  '{"ticket_discount": 5, "early_access_hours": 24, "credits_per_quarter": 0}'::jsonb
),
('main', 'main', 'Main', 2, 199.00, 19.99, 'triangle', '#000000',
  '{"all_basic": true, "quarterly_credits": true, "member_lounges": true, "exclusive_content": true, "priority_support": true, "digital_collectibles": true}'::jsonb,
  '{"ticket_discount": 15, "early_access_hours": 48, "credits_per_quarter": 1, "merchandise_discount": 10}'::jsonb
),
('extra', 'extra', 'Extra', 3, 499.00, 49.99, 'star', '#FFFFFF',
  '{"all_main": true, "vip_upgrades": true, "exclusive_events": true, "concierge_support": true, "skip_line": true, "guest_privileges": true}'::jsonb,
  '{"ticket_discount": 25, "early_access_hours": 72, "credits_per_quarter": 2, "vip_upgrades_per_year": 4, "merchandise_discount": 20, "guests_allowed": 1}'::jsonb
),
('business', 'business', 'Business', 4, 2499.00, 249.00, 'briefcase', '#000000',
  '{"all_extra": true, "team_management": true, "pooled_tickets": true, "private_suites": true, "account_manager": true, "custom_branding": true}'::jsonb,
  '{"ticket_discount": 30, "early_access_hours": 72, "credits_per_seat_per_quarter": 4, "min_seats": 5}'::jsonb
),
('first_class', 'first_class', 'First Class', 5, 1999.00, 199.00, 'crown', '#FFFFFF',
  '{"all_extra": true, "unlimited_ga": true, "guaranteed_vip": true, "backstage_access": true, "white_glove_concierge": true, "all_access_potential": true}'::jsonb,
  '{"ticket_discount": 35, "early_access_hours": 96, "vip_credits_per_quarter": 3, "merchandise_discount": 30, "guests_allowed": 3}'::jsonb
)
ON CONFLICT (tier_slug) DO NOTHING;
