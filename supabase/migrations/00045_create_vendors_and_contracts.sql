-- ============================================================================
-- VENDORS & CONTRACTS
-- Part of Super Expansion: Vendor management and contracting
-- ============================================================================

-- Vendor Categories table
CREATE TABLE IF NOT EXISTS vendor_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  description TEXT,
  
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, category_slug)
);

-- Seed Default Vendor Categories
INSERT INTO vendor_categories (organization_id, category_name, category_slug, display_order) VALUES
(NULL, 'Audio/Visual', 'audio-visual', 1),
(NULL, 'Lighting', 'lighting', 2),
(NULL, 'Staging', 'staging', 3),
(NULL, 'Catering', 'catering', 4),
(NULL, 'Security', 'security', 5),
(NULL, 'Transportation', 'transportation', 6),
(NULL, 'Accommodations', 'accommodations', 7),
(NULL, 'Photography/Video', 'photography-video', 8),
(NULL, 'Printing/Signage', 'printing-signage', 9),
(NULL, 'Rental Equipment', 'rental-equipment', 10),
(NULL, 'Staffing', 'staffing', 11),
(NULL, 'Talent/Performers', 'talent', 12),
(NULL, 'Marketing/PR', 'marketing-pr', 13),
(NULL, 'Insurance', 'insurance', 14),
(NULL, 'Legal', 'legal', 15)
ON CONFLICT DO NOTHING;

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES vendor_categories(id),
  
  -- Basic Information
  vendor_name TEXT NOT NULL,
  vendor_slug TEXT NOT NULL,
  company_name TEXT,
  
  -- Contact Information
  primary_contact_name TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  website_url TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Business Details
  tax_id TEXT,
  business_license TEXT,
  insurance_certificate_url TEXT,
  insurance_expiry_date DATE,
  
  -- Payment Terms
  payment_terms TEXT,
  default_payment_method TEXT,
  net_days INTEGER DEFAULT 30,
  
  -- Ratings & Reviews
  quality_rating DECIMAL(3,2) CHECK (quality_rating BETWEEN 0 AND 5),
  reliability_rating DECIMAL(3,2) CHECK (reliability_rating BETWEEN 0 AND 5),
  communication_rating DECIMAL(3,2) CHECK (communication_rating BETWEEN 0 AND 5),
  overall_rating DECIMAL(3,2) CHECK (overall_rating BETWEEN 0 AND 5),
  total_projects INTEGER DEFAULT 0,
  
  -- Status
  vendor_status TEXT DEFAULT 'active' CHECK (vendor_status IN ('prospective', 'active', 'inactive', 'blacklisted')),
  is_preferred BOOLEAN DEFAULT false,
  
  -- Metadata
  services_offered TEXT[],
  specializations TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, vendor_slug)
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  
  -- Contract Details
  contract_number TEXT NOT NULL UNIQUE,
  contract_name TEXT NOT NULL,
  contract_type TEXT CHECK (contract_type IN ('vendor', 'venue', 'talent', 'sponsor', 'service', 'other')),
  
  -- Financial
  contract_value DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_schedule TEXT,
  deposit_amount DECIMAL(12,2),
  deposit_due_date DATE,
  final_payment_due_date DATE,
  
  -- Timeline
  effective_date DATE NOT NULL,
  expiration_date DATE,
  notice_period_days INTEGER,
  
  -- Terms
  terms_and_conditions TEXT,
  deliverables TEXT,
  cancellation_policy TEXT,
  
  -- Status
  contract_status TEXT NOT NULL DEFAULT 'draft' CHECK (contract_status IN (
    'draft',
    'pending_review',
    'pending_signature',
    'active',
    'completed',
    'cancelled',
    'expired'
  )),
  
  -- Signatures
  signed_by_organization BOOLEAN DEFAULT false,
  organization_signatory TEXT,
  organization_signed_at TIMESTAMPTZ,
  
  signed_by_vendor BOOLEAN DEFAULT false,
  vendor_signatory TEXT,
  vendor_signed_at TIMESTAMPTZ,
  
  -- Documents
  contract_document_url TEXT,
  signed_contract_url TEXT,
  
  -- Renewal
  is_renewable BOOLEAN DEFAULT false,
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Deliverables table
CREATE TABLE IF NOT EXISTS vendor_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id),
  
  -- Deliverable Details
  deliverable_name TEXT NOT NULL,
  description TEXT,
  deliverable_type TEXT,
  
  -- Timeline
  requested_at TIMESTAMPTZ NOT NULL,
  due_date DATE NOT NULL,
  delivered_at TIMESTAMPTZ,
  
  -- Status
  deliverable_status TEXT NOT NULL DEFAULT 'pending' CHECK (deliverable_status IN (
    'pending',
    'in_progress',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'completed'
  )),
  
  -- Quality Control
  quality_check_required BOOLEAN DEFAULT false,
  quality_check_passed BOOLEAN,
  quality_checked_by UUID REFERENCES auth.users(id),
  quality_checked_at TIMESTAMPTZ,
  
  -- Documents/Files
  submission_url TEXT,
  approved_file_url TEXT,
  
  -- Feedback
  feedback TEXT,
  rejection_reason TEXT,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vendor_categories_org ON vendor_categories(organization_id);
CREATE INDEX idx_vendor_categories_active ON vendor_categories(is_active);

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_category ON vendors(category_id);
CREATE INDEX idx_vendors_status ON vendors(vendor_status);
CREATE INDEX idx_vendors_slug ON vendors(vendor_slug);
CREATE INDEX idx_vendors_preferred ON vendors(is_preferred);

CREATE INDEX idx_contracts_event ON contracts(event_id);
CREATE INDEX idx_contracts_org ON contracts(organization_id);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id);
CREATE INDEX idx_contracts_status ON contracts(contract_status);
CREATE INDEX idx_contracts_number ON contracts(contract_number);

CREATE INDEX idx_deliverables_event ON vendor_deliverables(event_id);
CREATE INDEX idx_deliverables_contract ON vendor_deliverables(contract_id);
CREATE INDEX idx_deliverables_vendor ON vendor_deliverables(vendor_id);
CREATE INDEX idx_deliverables_task ON vendor_deliverables(task_id);
CREATE INDEX idx_deliverables_status ON vendor_deliverables(deliverable_status);
CREATE INDEX idx_deliverables_due_date ON vendor_deliverables(due_date);

-- RLS Policies
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_deliverables ENABLE ROW LEVEL SECURITY;

-- Vendor Categories: Users can view categories for their organizations
CREATE POLICY "Users can view vendor categories"
  ON vendor_categories FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Vendor Categories: Vendor managers can manage categories
CREATE POLICY "Vendor managers can manage vendor categories"
  ON vendor_categories FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'vendor_manager', 'event_manager')
    )
  );

-- Vendors: Users can view vendors for their organizations
CREATE POLICY "Users can view vendors"
  ON vendors FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Vendors: Vendor managers can manage vendors
CREATE POLICY "Vendor managers can manage vendors"
  ON vendors FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'vendor_manager', 'event_manager', 'production_coordinator')
    )
  );

-- Contracts: Users can view contracts for their organization's events
CREATE POLICY "Users can view contracts"
  ON contracts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Contracts: Event managers can manage contracts
CREATE POLICY "Event managers can manage contracts"
  ON contracts FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager', 'vendor_manager', 'finance_manager')
    )
  );

-- Vendor Deliverables: Users can view deliverables for their organization's events
CREATE POLICY "Users can view vendor deliverables"
  ON vendor_deliverables FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Vendor Deliverables: Event staff can manage deliverables
CREATE POLICY "Event staff can manage vendor deliverables"
  ON vendor_deliverables FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator', 'vendor_manager')
      )
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_vendor_categories_updated_at
  BEFORE UPDATE ON vendor_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_deliverables_updated_at
  BEFORE UPDATE ON vendor_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
