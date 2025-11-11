-- Update Membership Pricing to Gym-Comparable Rates
-- Add Companion Pass System
-- Reorder Business to Tier 6
-- Date: January 11, 2025

-- Update tier levels to reorder Business after First Class
UPDATE membership_tiers SET tier_level = 6 WHERE tier_slug = 'business';
UPDATE membership_tiers SET tier_level = 5 WHERE tier_slug = 'first_class';

-- Update pricing to gym-comparable rates
UPDATE membership_tiers SET 
  annual_price = 199.99,
  monthly_price = 19.99
WHERE tier_slug = 'basic';

UPDATE membership_tiers SET 
  annual_price = 399.99,
  monthly_price = 39.99
WHERE tier_slug = 'main';

UPDATE membership_tiers SET 
  annual_price = 799.99,
  monthly_price = 79.99
WHERE tier_slug = 'extra';

UPDATE membership_tiers SET 
  annual_price = 1999.99,
  monthly_price = 199.99
WHERE tier_slug = 'first_class';

UPDATE membership_tiers SET 
  annual_price = 4999.99,
  monthly_price = 499.99
WHERE tier_slug = 'business';

-- Create companion pass add-ons table
CREATE TABLE IF NOT EXISTS membership_companion_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id uuid REFERENCES membership_tiers(id) ON DELETE CASCADE,
  pass_name text NOT NULL,
  pass_slug text NOT NULL,
  description text,
  monthly_price decimal(10,2) NOT NULL,
  annual_price decimal(10,2) NOT NULL,
  max_companions integer NOT NULL DEFAULT 1,
  benefits jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tier_id, pass_slug)
);

-- Create user companion pass subscriptions
CREATE TABLE IF NOT EXISTS user_companion_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_membership_id uuid REFERENCES user_memberships(id) ON DELETE CASCADE,
  companion_pass_id uuid REFERENCES membership_companion_passes(id),
  status text NOT NULL DEFAULT 'active', -- active, cancelled, expired
  billing_cycle text, -- monthly, annual
  start_date timestamptz NOT NULL DEFAULT now(),
  renewal_date timestamptz,
  cancellation_date timestamptz,
  stripe_subscription_id text UNIQUE,
  companions_registered integer DEFAULT 0,
  max_companions integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create companion profiles (the actual guest users)
CREATE TABLE IF NOT EXISTS companion_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_companion_pass_id uuid REFERENCES user_companion_passes(id) ON DELETE CASCADE,
  primary_member_id uuid REFERENCES auth.users(id),
  companion_email text NOT NULL,
  companion_name text NOT NULL,
  companion_phone text,
  relationship text, -- partner, friend, family, colleague
  status text DEFAULT 'active', -- active, inactive, removed
  access_level text DEFAULT 'standard', -- standard, limited
  can_purchase_tickets boolean DEFAULT true,
  can_access_lounges boolean DEFAULT true,
  can_attend_exclusive_events boolean DEFAULT false,
  invitation_sent_at timestamptz,
  invitation_accepted_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_companion_pass_id, companion_email)
);

-- Indexes for performance
CREATE INDEX idx_companion_passes_tier_id ON membership_companion_passes(tier_id);
CREATE INDEX idx_user_companion_passes_membership_id ON user_companion_passes(user_membership_id);
CREATE INDEX idx_user_companion_passes_status ON user_companion_passes(status);
CREATE INDEX idx_companion_profiles_primary_member ON companion_profiles(primary_member_id);
CREATE INDEX idx_companion_profiles_email ON companion_profiles(companion_email);

-- RLS Policies
ALTER TABLE membership_companion_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companion_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_profiles ENABLE ROW LEVEL SECURITY;

-- Public can view available companion passes
CREATE POLICY "Public can view companion passes"
  ON membership_companion_passes FOR SELECT
  USING (is_active = true);

-- Users can view their own companion pass subscriptions
CREATE POLICY "Users can view own companion passes"
  ON user_companion_passes FOR SELECT
  USING (
    user_membership_id IN (
      SELECT id FROM user_memberships WHERE user_id = auth.uid()
    )
  );

-- Users can view their companion profiles
CREATE POLICY "Users can view own companions"
  ON companion_profiles FOR SELECT
  USING (primary_member_id = auth.uid());

-- Users can manage their companion profiles
CREATE POLICY "Users can manage companions"
  ON companion_profiles FOR ALL
  USING (primary_member_id = auth.uid());

-- Seed companion pass add-ons for non-business tiers
INSERT INTO membership_companion_passes (tier_id, pass_name, pass_slug, description, monthly_price, annual_price, max_companions, benefits) 
SELECT 
  id,
  'Companion Pass',
  'companion-pass',
  'Add a companion to share your membership benefits',
  9.99,
  99.99,
  1,
  '{"shared_presale_access": true, "shared_lounge_access": true, "shared_discounts": true, "separate_digital_card": true}'::jsonb
FROM membership_tiers 
WHERE tier_slug = 'basic'
ON CONFLICT (tier_id, pass_slug) DO NOTHING;

INSERT INTO membership_companion_passes (tier_id, pass_name, pass_slug, description, monthly_price, annual_price, max_companions, benefits)
SELECT 
  id,
  'Companion Pass',
  'companion-pass',
  'Add a companion to share your membership benefits',
  14.99,
  149.99,
  1,
  '{"shared_presale_access": true, "shared_lounge_access": true, "shared_discounts": true, "shared_credits": true, "separate_digital_card": true, "shared_exclusive_content": true}'::jsonb
FROM membership_tiers 
WHERE tier_slug = 'main'
ON CONFLICT (tier_id, pass_slug) DO NOTHING;

INSERT INTO membership_companion_passes (tier_id, pass_name, pass_slug, description, monthly_price, annual_price, max_companions, benefits)
SELECT 
  id,
  'Companion Pass',
  'companion-pass',
  'Add a companion to share your VIP membership benefits',
  24.99,
  249.99,
  1,
  '{"shared_presale_access": true, "shared_lounge_access": true, "shared_discounts": true, "shared_credits": true, "shared_vip_upgrades": true, "separate_digital_card": true, "shared_exclusive_events": true, "shared_skip_line": true}'::jsonb
FROM membership_tiers 
WHERE tier_slug = 'extra'
ON CONFLICT (tier_id, pass_slug) DO NOTHING;

INSERT INTO membership_companion_passes (tier_id, pass_name, pass_slug, description, monthly_price, annual_price, max_companions, benefits)
SELECT 
  id,
  'Companion Pass',
  'companion-pass',
  'Add a companion to share your First Class membership benefits',
  49.99,
  499.99,
  1,
  '{"shared_presale_access": true, "shared_lounge_access": true, "shared_discounts": true, "shared_credits": true, "shared_vip_access": true, "separate_digital_card": true, "shared_exclusive_events": true, "shared_backstage_access": true, "shared_concierge": true}'::jsonb
FROM membership_tiers 
WHERE tier_slug = 'first_class'
ON CONFLICT (tier_id, pass_slug) DO NOTHING;

-- Update triggers
CREATE TRIGGER update_companion_passes_updated_at
  BEFORE UPDATE ON membership_companion_passes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_companion_passes_updated_at
  BEFORE UPDATE ON user_companion_passes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companion_profiles_updated_at
  BEFORE UPDATE ON companion_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check companion pass limits
CREATE OR REPLACE FUNCTION check_companion_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) 
    FROM companion_profiles 
    WHERE user_companion_pass_id = NEW.user_companion_pass_id 
    AND status = 'active'
  ) >= (
    SELECT max_companions 
    FROM user_companion_passes 
    WHERE id = NEW.user_companion_pass_id
  ) THEN
    RAISE EXCEPTION 'Maximum number of companions reached for this pass';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_companion_limit
  BEFORE INSERT ON companion_profiles
  FOR EACH ROW EXECUTE FUNCTION check_companion_limit();

-- Function to increment companions registered count
CREATE OR REPLACE FUNCTION increment_companions_registered(pass_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_companion_passes
  SET companions_registered = companions_registered + 1
  WHERE id = pass_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement companions registered count
CREATE OR REPLACE FUNCTION decrement_companions_registered(pass_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_companion_passes
  SET companions_registered = GREATEST(0, companions_registered - 1)
  WHERE id = pass_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE membership_companion_passes IS 'Companion pass add-on products for membership tiers';
COMMENT ON TABLE user_companion_passes IS 'User subscriptions to companion passes';
COMMENT ON TABLE companion_profiles IS 'Individual companion/guest profiles linked to member accounts';
