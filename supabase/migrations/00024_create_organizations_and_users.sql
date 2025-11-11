-- ============================================================================
-- ORGANIZATIONS & USERS EXPANSION
-- Part of Super Expansion: Full event production platform
-- ============================================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  organization_slug TEXT NOT NULL UNIQUE,
  organization_type TEXT CHECK (organization_type IN ('production_company', 'venue', 'promoter', 'artist_management', 'vendor')),
  
  -- Contact Information
  primary_contact_name TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  website_url TEXT,
  
  -- Business Details
  tax_id TEXT,
  business_license TEXT,
  insurance_policy_number TEXT,
  insurance_expiry_date DATE,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Settings
  timezone TEXT DEFAULT 'America/New_York',
  currency TEXT DEFAULT 'USD',
  fiscal_year_start DATE,
  
  -- Branding
  logo_url TEXT,
  brand_colors JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  subscription_tier TEXT DEFAULT 'pro',
  subscription_status TEXT DEFAULT 'active',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User organizations junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Role & Permissions (based on ATLVS 11 roles)
  role TEXT NOT NULL CHECK (role IN (
    'system_admin',
    'organization_owner', 
    'event_manager',
    'production_coordinator',
    'vendor_manager',
    'finance_manager',
    'marketing_manager',
    'staff_member',
    'vendor',
    'client',
    'viewer'
  )),
  
  -- Status
  is_primary_org BOOLEAN DEFAULT false,
  invitation_status TEXT DEFAULT 'active' CHECK (invitation_status IN ('pending', 'active', 'suspended', 'revoked')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(organization_slug);
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_active ON organizations(is_active);

CREATE INDEX idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id);
CREATE INDEX idx_user_orgs_role ON user_organizations(role);
CREATE INDEX idx_user_orgs_status ON user_organizations(invitation_status);

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can view organizations they belong to
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Organizations: Organization owners can update their organization
CREATE POLICY "Organization owners can update"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner')
    )
  );

-- User Organizations: Users can view their own memberships
CREATE POLICY "Users can view their organization memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());

-- User Organizations: Organization owners can manage memberships
CREATE POLICY "Organization owners can manage memberships"
  ON user_organizations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner')
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_organizations_updated_at
  BEFORE UPDATE ON user_organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
