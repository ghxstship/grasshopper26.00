-- Update Membership Tiers to New 2025 Structure
-- Individual Memberships: Community, Access, Plus, Extra
-- Date: January 11, 2025

-- Rename 'basic' to 'access' and 'main' to 'plus'
UPDATE membership_tiers SET 
  tier_name = 'access',
  tier_slug = 'access',
  display_name = 'Access',
  tier_level = 1,
  annual_price = 200.00,
  monthly_price = 20.00
WHERE tier_slug = 'basic';

UPDATE membership_tiers SET 
  tier_name = 'plus',
  tier_slug = 'plus',
  display_name = 'Plus',
  tier_level = 2,
  annual_price = 500.00,
  monthly_price = 50.00
WHERE tier_slug = 'main';

-- Update Extra tier pricing
UPDATE membership_tiers SET 
  annual_price = 1000.00,
  monthly_price = 100.00,
  tier_level = 3
WHERE tier_slug = 'extra';

-- Mark First Class and Business as inactive (replaced by custom corporate)
UPDATE membership_tiers SET 
  is_active = false
WHERE tier_slug IN ('first_class', 'business');

-- Update companion pass pricing for Access tier
UPDATE membership_companion_passes SET 
  monthly_price = 10.00,
  annual_price = 100.00,
  is_active = false
WHERE tier_id = (SELECT id FROM membership_tiers WHERE tier_slug = 'access');

-- Update companion pass pricing for Plus tier
UPDATE membership_companion_passes SET 
  monthly_price = 25.00,
  annual_price = 250.00
WHERE tier_id = (SELECT id FROM membership_tiers WHERE tier_slug = 'plus');

-- Update companion pass pricing for Extra tier
UPDATE membership_companion_passes SET 
  monthly_price = 50.00,
  annual_price = 500.00
WHERE tier_id = (SELECT id FROM membership_tiers WHERE tier_slug = 'extra');

-- Remove companion passes from First Class and Business (now inactive)
UPDATE membership_companion_passes SET 
  is_active = false
WHERE tier_id IN (
  SELECT id FROM membership_tiers WHERE tier_slug IN ('first_class', 'business')
);

-- Create special discount codes table
CREATE TABLE IF NOT EXISTS membership_discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL, -- student, educator, veteran, senior
  discount_percentage integer NOT NULL,
  description text,
  verification_required boolean DEFAULT true,
  verification_instructions text,
  stripe_coupon_id text,
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user discount verifications table
CREATE TABLE IF NOT EXISTS user_discount_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_code_id uuid REFERENCES membership_discount_codes(id),
  verification_status text DEFAULT 'pending', -- pending, approved, rejected, expired
  verification_document_url text,
  verification_notes text,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, discount_code_id)
);

-- Indexes
CREATE INDEX idx_discount_codes_type ON membership_discount_codes(discount_type);
CREATE INDEX idx_discount_codes_active ON membership_discount_codes(is_active);
CREATE INDEX idx_user_verifications_user_id ON user_discount_verifications(user_id);
CREATE INDEX idx_user_verifications_status ON user_discount_verifications(verification_status);

-- RLS Policies
ALTER TABLE membership_discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discount_verifications ENABLE ROW LEVEL SECURITY;

-- Public can view active discount codes
CREATE POLICY "Public can view active discount codes"
  ON membership_discount_codes FOR SELECT
  USING (is_active = true);

-- Users can view their own verifications
CREATE POLICY "Users can view own verifications"
  ON user_discount_verifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own verifications
CREATE POLICY "Users can create verifications"
  ON user_discount_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Triggers
CREATE TRIGGER update_discount_codes_updated_at
  BEFORE UPDATE ON membership_discount_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_verifications_updated_at
  BEFORE UPDATE ON user_discount_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed special discount codes
INSERT INTO membership_discount_codes (code, discount_type, discount_percentage, description, verification_required, verification_instructions) VALUES
('STUDENT25', 'student', 25, '25% discount for students with valid student ID', true, 'Upload a photo of your current student ID or enrollment letter'),
('EDUCATOR25', 'educator', 25, '25% discount for educators with valid ID', true, 'Upload a photo of your teacher/faculty ID or employment letter'),
('VETERAN25', 'veteran', 25, '25% discount for veterans with valid ID', true, 'Upload a photo of your military ID, DD214, or VA card'),
('SENIOR25', 'senior', 25, '25% discount for seniors (65+) with valid ID', true, 'Upload a photo of your driver''s license or government-issued ID showing date of birth')
ON CONFLICT (code) DO NOTHING;

-- Update benefits for new tier structure
UPDATE membership_tiers SET 
  benefits = '{"browse_events": true, "view_artists": true, "email_newsletter": true, "save_favorites": true, "basic_notifications": true}'::jsonb,
  limits = '{"can_purchase_tickets": false, "ticket_discount": 0, "early_access_hours": 0}'::jsonb
WHERE tier_slug = 'community';

UPDATE membership_tiers SET 
  benefits = '{"all_community": true, "purchase_tickets": true, "member_presales": true, "digital_card": true, "priority_support": true}'::jsonb,
  limits = '{"ticket_discount": 10, "early_access_hours": 24, "credits_per_quarter": 0}'::jsonb
WHERE tier_slug = 'access';

UPDATE membership_tiers SET 
  benefits = '{"all_access": true, "quarterly_credits": true, "member_lounges": true, "exclusive_content": true, "priority_support": true, "vip_upgrades": true}'::jsonb,
  limits = '{"ticket_discount": 15, "early_access_hours": 48, "credits_per_quarter": 2, "vip_upgrades_per_year": 2, "merchandise_discount": 10}'::jsonb
WHERE tier_slug = 'plus';

UPDATE membership_tiers SET 
  benefits = '{"all_plus": true, "vip_upgrades": true, "exclusive_events": true, "concierge_support": true, "skip_line": true, "guest_privileges": true, "backstage_access": true}'::jsonb,
  limits = '{"ticket_discount": 20, "early_access_hours": 72, "credits_per_quarter": 4, "vip_upgrades_per_year": 4, "merchandise_discount": 20, "guests_allowed": 2}'::jsonb
WHERE tier_slug = 'extra';

COMMENT ON TABLE membership_discount_codes IS 'Special discount codes for students, educators, veterans, and seniors';
COMMENT ON TABLE user_discount_verifications IS 'User verification records for special discount eligibility';
