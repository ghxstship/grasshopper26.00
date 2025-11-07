-- Comprehensive loyalty and referral program

-- Loyalty transaction type enum
CREATE TYPE loyalty_transaction_type AS ENUM (
  'earned_purchase',
  'earned_referral',
  'earned_signup',
  'earned_event_attendance',
  'earned_review',
  'earned_social_share',
  'earned_bonus',
  'redeemed_discount',
  'redeemed_reward',
  'expired',
  'adjusted_admin'
);

-- Loyalty transactions table
CREATE TABLE loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type loyalty_transaction_type NOT NULL,
  points integer NOT NULL,
  description text NOT NULL,
  reference_id uuid, -- Order ID, event ID, etc.
  reference_type text, -- 'order', 'event', 'referral', etc.
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT NOW()
);

-- Referral codes table
CREATE TABLE referral_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  uses integer DEFAULT 0,
  max_uses integer,
  points_per_use integer DEFAULT 100,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Referral usage tracking
CREATE TABLE referral_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code_id uuid NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_awarded integer NOT NULL,
  order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT NOW()
);

-- Loyalty rewards catalog
CREATE TABLE loyalty_rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  points_required integer NOT NULL,
  reward_type text NOT NULL, -- 'discount_percentage', 'discount_fixed', 'free_item', 'upgrade', 'exclusive_access'
  reward_value jsonb NOT NULL,
  image_url text,
  quantity_available integer,
  quantity_redeemed integer DEFAULT 0,
  active boolean DEFAULT true,
  valid_from timestamptz,
  valid_until timestamptz,
  terms_conditions text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Loyalty reward redemptions
CREATE TABLE loyalty_redemptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES loyalty_rewards(id),
  points_spent integer NOT NULL,
  redemption_code text UNIQUE,
  status text DEFAULT 'pending', -- pending, used, expired, cancelled
  used_at timestamptz,
  expires_at timestamptz,
  order_id uuid REFERENCES orders(id),
  metadata jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);
CREATE INDEX idx_loyalty_transactions_expires_at ON loyalty_transactions(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_active ON referral_codes(active) WHERE active = true;

CREATE INDEX idx_referral_usage_referrer ON referral_usage(referrer_user_id);
CREATE INDEX idx_referral_usage_referred ON referral_usage(referred_user_id);
CREATE INDEX idx_referral_usage_code ON referral_usage(referral_code_id);

CREATE INDEX idx_loyalty_rewards_brand_id ON loyalty_rewards(brand_id);
CREATE INDEX idx_loyalty_rewards_active ON loyalty_rewards(active) WHERE active = true;

CREATE INDEX idx_loyalty_redemptions_user_id ON loyalty_redemptions(user_id);
CREATE INDEX idx_loyalty_redemptions_status ON loyalty_redemptions(status);
CREATE INDEX idx_loyalty_redemptions_code ON loyalty_redemptions(redemption_code);

-- Enable RLS
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own referral codes"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their referral usage"
  ON referral_usage FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Public can view active loyalty rewards"
  ON loyalty_rewards FOR SELECT
  USING (active = true);

CREATE POLICY "Users can view their own redemptions"
  ON loyalty_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Function to award loyalty points
CREATE OR REPLACE FUNCTION award_loyalty_points(
  p_user_id uuid,
  p_type loyalty_transaction_type,
  p_points integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_expires_days integer DEFAULT 365
)
RETURNS uuid AS $$
DECLARE
  transaction_id uuid;
  new_total integer;
BEGIN
  -- Create transaction
  INSERT INTO loyalty_transactions (
    user_id,
    type,
    points,
    description,
    reference_id,
    reference_type,
    expires_at
  ) VALUES (
    p_user_id,
    p_type,
    p_points,
    p_description,
    p_reference_id,
    p_reference_type,
    CASE WHEN p_expires_days > 0 THEN NOW() + INTERVAL '1 day' * p_expires_days ELSE NULL END
  )
  RETURNING id INTO transaction_id;
  
  -- Update user profile total
  UPDATE user_profiles
  SET loyalty_points = loyalty_points + p_points
  WHERE id = p_user_id
  RETURNING loyalty_points INTO new_total;
  
  -- Create notification
  PERFORM create_notification(
    p_user_id,
    'loyalty_reward'::notification_type,
    'in_app'::notification_channel,
    'Points Earned!',
    format('You earned %s loyalty points. %s', p_points, p_description),
    '/profile/loyalty',
    'View Points'
  );
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem loyalty points
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
  p_reward_id uuid
)
RETURNS uuid AS $$
DECLARE
  redemption_id uuid;
  reward_points integer;
  user_points integer;
  redemption_code text;
BEGIN
  -- Get reward points required
  SELECT points_required INTO reward_points
  FROM loyalty_rewards
  WHERE id = p_reward_id AND active = true;
  
  IF reward_points IS NULL THEN
    RAISE EXCEPTION 'Reward not found or inactive';
  END IF;
  
  -- Get user points
  SELECT loyalty_points INTO user_points
  FROM user_profiles
  WHERE id = auth.uid();
  
  IF user_points < reward_points THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- Generate redemption code
  redemption_code := 'RDM-' || upper(substring(md5(random()::text) from 1 for 8));
  
  -- Create redemption
  INSERT INTO loyalty_redemptions (
    user_id,
    reward_id,
    points_spent,
    redemption_code,
    expires_at
  ) VALUES (
    auth.uid(),
    p_reward_id,
    reward_points,
    redemption_code,
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO redemption_id;
  
  -- Deduct points
  PERFORM award_loyalty_points(
    auth.uid(),
    'redeemed_reward'::loyalty_transaction_type,
    -reward_points,
    'Redeemed loyalty reward',
    redemption_id,
    'redemption'
  );
  
  -- Update reward quantity
  UPDATE loyalty_rewards
  SET quantity_redeemed = quantity_redeemed + 1
  WHERE id = p_reward_id;
  
  RETURN redemption_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  new_code text;
  user_name text;
BEGIN
  -- Get username or generate from email
  SELECT COALESCE(username, split_part(email, '@', 1))
  INTO user_name
  FROM user_profiles
  JOIN auth.users ON user_profiles.id = auth.users.id
  WHERE user_profiles.id = auth.uid();
  
  -- Generate code: USERNAME-XXXX
  new_code := upper(user_name) || '-' || upper(substring(md5(random()::text) from 1 for 4));
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = new_code) LOOP
    new_code := upper(user_name) || '-' || upper(substring(md5(random()::text) from 1 for 4));
  END LOOP;
  
  -- Create referral code
  INSERT INTO referral_codes (user_id, code)
  VALUES (auth.uid(), new_code);
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply referral code
CREATE OR REPLACE FUNCTION apply_referral_code(p_code text)
RETURNS boolean AS $$
DECLARE
  code_record RECORD;
  referrer_id uuid;
BEGIN
  -- Get referral code details
  SELECT * INTO code_record
  FROM referral_codes
  WHERE code = upper(p_code)
    AND active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses < max_uses);
  
  IF code_record IS NULL THEN
    RETURN false;
  END IF;
  
  referrer_id := code_record.user_id;
  
  -- Can't refer yourself
  IF referrer_id = auth.uid() THEN
    RETURN false;
  END IF;
  
  -- Check if already used this code
  IF EXISTS (
    SELECT 1 FROM referral_usage
    WHERE referral_code_id = code_record.id
      AND referred_user_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;
  
  -- Record usage
  INSERT INTO referral_usage (
    referral_code_id,
    referrer_user_id,
    referred_user_id,
    points_awarded
  ) VALUES (
    code_record.id,
    referrer_id,
    auth.uid(),
    code_record.points_per_use
  );
  
  -- Update referral code uses
  UPDATE referral_codes
  SET uses = uses + 1
  WHERE id = code_record.id;
  
  -- Award points to referrer
  PERFORM award_loyalty_points(
    referrer_id,
    'earned_referral'::loyalty_transaction_type,
    code_record.points_per_use,
    'Referral bonus',
    auth.uid(),
    'referral'
  );
  
  -- Award points to referred user
  PERFORM award_loyalty_points(
    auth.uid(),
    'earned_signup'::loyalty_transaction_type,
    code_record.points_per_use / 2,
    'Welcome bonus',
    referrer_id,
    'referral'
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old loyalty points
CREATE OR REPLACE FUNCTION expire_loyalty_points()
RETURNS integer AS $$
DECLARE
  expired_count integer := 0;
  transaction_record RECORD;
BEGIN
  FOR transaction_record IN
    SELECT user_id, SUM(points) as expired_points
    FROM loyalty_transactions
    WHERE expires_at < NOW()
      AND type NOT IN ('expired', 'redeemed_discount', 'redeemed_reward')
    GROUP BY user_id
  LOOP
    -- Create expiration transaction
    INSERT INTO loyalty_transactions (
      user_id,
      type,
      points,
      description
    ) VALUES (
      transaction_record.user_id,
      'expired'::loyalty_transaction_type,
      -transaction_record.expired_points,
      'Points expired'
    );
    
    -- Update user profile
    UPDATE user_profiles
    SET loyalty_points = GREATEST(loyalty_points - transaction_record.expired_points, 0)
    WHERE id = transaction_record.user_id;
    
    expired_count := expired_count + 1;
  END LOOP;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_rewards_updated_at
  BEFORE UPDATE ON loyalty_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_redemptions_updated_at
  BEFORE UPDATE ON loyalty_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
