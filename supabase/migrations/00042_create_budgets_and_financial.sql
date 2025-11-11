-- ============================================================================
-- BUDGETS & FINANCIAL TRACKING
-- Part of Super Expansion: Comprehensive budget management
-- ============================================================================

-- Budget Categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  parent_category_id UUID REFERENCES budget_categories(id),
  
  -- Classification
  budget_type TEXT NOT NULL CHECK (budget_type IN ('revenue', 'expense')),
  
  -- Display
  icon_name TEXT,
  color_hex TEXT,
  display_order INTEGER,
  
  -- Configuration
  is_default BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  approval_threshold DECIMAL(10,2),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, category_slug)
);

-- Seed Default Budget Categories (organization_id NULL = global defaults)
INSERT INTO budget_categories (organization_id, category_name, category_slug, budget_type, is_default, display_order) VALUES
-- Revenue Categories
(NULL, 'Ticket Sales', 'ticket-sales', 'revenue', true, 1),
(NULL, 'VIP Packages', 'vip-packages', 'revenue', true, 2),
(NULL, 'Sponsorships', 'sponsorships', 'revenue', true, 3),
(NULL, 'Merchandise', 'merchandise', 'revenue', true, 4),
(NULL, 'Food & Beverage', 'food-beverage', 'revenue', true, 5),
(NULL, 'Parking', 'parking', 'revenue', true, 6),
(NULL, 'Media Rights', 'media-rights', 'revenue', true, 7),
-- Expense Categories
(NULL, 'Venue Rental', 'venue-rental', 'expense', true, 10),
(NULL, 'Talent/Performers', 'talent', 'expense', true, 11),
(NULL, 'Production', 'production', 'expense', true, 12),
(NULL, 'Audio/Visual', 'audio-visual', 'expense', true, 13),
(NULL, 'Lighting', 'lighting', 'expense', true, 14),
(NULL, 'Staging', 'staging', 'expense', true, 15),
(NULL, 'Marketing', 'marketing', 'expense', true, 16),
(NULL, 'Staffing', 'staffing', 'expense', true, 17),
(NULL, 'Security', 'security', 'expense', true, 18),
(NULL, 'Insurance', 'insurance', 'expense', true, 19),
(NULL, 'Permits & Licenses', 'permits-licenses', 'expense', true, 20),
(NULL, 'Catering', 'catering', 'expense', true, 21),
(NULL, 'Transportation', 'transportation', 'expense', true, 22),
(NULL, 'Accommodations', 'accommodations', 'expense', true, 23),
(NULL, 'Contingency', 'contingency', 'expense', true, 24)
ON CONFLICT DO NOTHING;

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  budget_name TEXT NOT NULL,
  budget_version INTEGER DEFAULT 1,
  
  -- Totals
  total_revenue_budgeted DECIMAL(12,2) DEFAULT 0,
  total_expenses_budgeted DECIMAL(12,2) DEFAULT 0,
  total_profit_budgeted DECIMAL(12,2) GENERATED ALWAYS AS (total_revenue_budgeted - total_expenses_budgeted) STORED,
  profit_margin_budgeted DECIMAL(5,2),
  
  -- Actuals
  total_revenue_actual DECIMAL(12,2) DEFAULT 0,
  total_expenses_actual DECIMAL(12,2) DEFAULT 0,
  total_profit_actual DECIMAL(12,2) GENERATED ALWAYS AS (total_revenue_actual - total_expenses_actual) STORED,
  profit_margin_actual DECIMAL(5,2),
  
  -- Variance
  revenue_variance DECIMAL(12,2) GENERATED ALWAYS AS (total_revenue_actual - total_revenue_budgeted) STORED,
  expense_variance DECIMAL(12,2) GENERATED ALWAYS AS (total_expenses_actual - total_expenses_budgeted) STORED,
  profit_variance DECIMAL(12,2) GENERATED ALWAYS AS ((total_revenue_actual - total_expenses_actual) - (total_revenue_budgeted - total_expenses_budgeted)) STORED,
  
  -- Status
  budget_status TEXT DEFAULT 'draft' CHECK (budget_status IN ('draft', 'pending_approval', 'approved', 'locked', 'closed')),
  is_baseline BOOLEAN DEFAULT false,
  
  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Lock
  locked_by UUID REFERENCES auth.users(id),
  locked_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Line Items table
CREATE TABLE IF NOT EXISTS budget_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),
  
  -- Item Details
  line_item_name TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('revenue', 'expense')),
  
  -- Budget Amounts
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_cost DECIMAL(10,2),
  budgeted_amount DECIMAL(12,2) NOT NULL,
  
  -- Actual Amounts
  actual_quantity DECIMAL(10,2),
  actual_unit_cost DECIMAL(10,2),
  actual_amount DECIMAL(12,2) DEFAULT 0,
  
  -- Variance
  variance_amount DECIMAL(12,2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
  variance_percentage DECIMAL(5,2),
  
  -- Vendor/Supplier
  vendor_id UUID REFERENCES organizations(id),
  vendor_name TEXT,
  
  -- Tracking
  purchase_order_number TEXT,
  invoice_number TEXT,
  payment_status TEXT CHECK (payment_status IN ('not_invoiced', 'invoiced', 'partially_paid', 'paid', 'overdue')),
  payment_due_date DATE,
  paid_date DATE,
  
  -- Cost Allocation
  is_fixed_cost BOOLEAN DEFAULT false,
  is_per_attendee BOOLEAN DEFAULT false,
  allocation_percentage DECIMAL(5,2),
  
  -- Status
  line_item_status TEXT DEFAULT 'planned' CHECK (line_item_status IN ('planned', 'approved', 'committed', 'invoiced', 'paid', 'cancelled')),
  
  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_budget_categories_org ON budget_categories(organization_id);
CREATE INDEX idx_budget_categories_type ON budget_categories(budget_type);
CREATE INDEX idx_budget_categories_parent ON budget_categories(parent_category_id);

CREATE INDEX idx_budgets_event ON budgets(event_id);
CREATE INDEX idx_budgets_org ON budgets(organization_id);
CREATE INDEX idx_budgets_status ON budgets(budget_status);

CREATE INDEX idx_budget_line_items_budget ON budget_line_items(budget_id);
CREATE INDEX idx_budget_line_items_category ON budget_line_items(category_id);
CREATE INDEX idx_budget_line_items_vendor ON budget_line_items(vendor_id);
CREATE INDEX idx_budget_line_items_status ON budget_line_items(line_item_status);
CREATE INDEX idx_budget_line_items_payment ON budget_line_items(payment_status);

-- RLS Policies
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;

-- Budget Categories: Users can view categories for their organizations
CREATE POLICY "Users can view budget categories"
  ON budget_categories FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Budget Categories: Finance managers can manage categories
CREATE POLICY "Finance managers can manage budget categories"
  ON budget_categories FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'finance_manager', 'event_manager')
    )
  );

-- Budgets: Users can view budgets for their organization's events
CREATE POLICY "Users can view budgets"
  ON budgets FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Budgets: Finance managers and event managers can manage budgets
CREATE POLICY "Finance managers can manage budgets"
  ON budgets FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'finance_manager', 'event_manager')
    )
  );

-- Budget Line Items: Users can view line items for accessible budgets
CREATE POLICY "Users can view budget line items"
  ON budget_line_items FOR SELECT
  USING (
    budget_id IN (
      SELECT id FROM budgets
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Budget Line Items: Finance managers can manage line items
CREATE POLICY "Finance managers can manage budget line items"
  ON budget_line_items FOR ALL
  USING (
    budget_id IN (
      SELECT id FROM budgets
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'finance_manager', 'event_manager')
      )
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_line_items_updated_at
  BEFORE UPDATE ON budget_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
