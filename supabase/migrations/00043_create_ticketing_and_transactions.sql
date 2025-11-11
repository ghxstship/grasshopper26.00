-- ============================================================================
-- TICKETING & TRANSACTIONS
-- Part of Super Expansion: Comprehensive ticketing system
-- ============================================================================

-- Ticket Tiers table
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  tier_name TEXT NOT NULL,
  tier_slug TEXT NOT NULL,
  tier_type TEXT CHECK (tier_type IN ('general_admission', 'vip', 'reserved_seating', 'early_bird', 'group', 'comp')),
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  fees DECIMAL(10,2) DEFAULT 0,
  taxes DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (base_price + fees + taxes) STORED,
  
  -- Capacity
  total_capacity INTEGER NOT NULL,
  tickets_sold INTEGER DEFAULT 0,
  tickets_available INTEGER GENERATED ALWAYS AS (total_capacity - tickets_sold) STORED,
  tickets_reserved INTEGER DEFAULT 0,
  
  -- Sales Period
  sale_start_date TIMESTAMPTZ,
  sale_end_date TIMESTAMPTZ,
  
  -- Restrictions
  min_purchase_quantity INTEGER DEFAULT 1,
  max_purchase_quantity INTEGER DEFAULT 10,
  requires_code BOOLEAN DEFAULT false,
  access_code TEXT,
  
  -- Benefits (for VIP tiers)
  benefits JSONB DEFAULT '[]',
  
  -- Display
  display_order INTEGER,
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, tier_slug)
);

-- Transactions table (must be created before tickets due to FK)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_number TEXT NOT NULL UNIQUE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'ticket_sale',
    'merchandise',
    'food_beverage',
    'parking',
    'sponsorship',
    'vendor_payment',
    'refund',
    'chargeback'
  )),
  
  -- Customer
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'venmo', 'cash', 'check', 'wire_transfer', 'comp')),
  payment_processor TEXT,
  payment_processor_id TEXT,
  
  -- Card Details (last 4 digits only)
  card_last_four TEXT,
  card_brand TEXT,
  
  -- Status
  transaction_status TEXT NOT NULL DEFAULT 'pending' CHECK (transaction_status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded',
    'chargeback'
  )),
  
  -- Timestamps
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  -- Refund Details
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  refunded_by UUID REFERENCES auth.users(id),
  
  -- Billing Address
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  
  -- Related Records
  budget_line_item_id UUID REFERENCES budget_line_items(id),
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES ticket_tiers(id),
  
  -- Ticket Identification
  ticket_number TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  qr_code TEXT UNIQUE,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  fees DECIMAL(10,2) DEFAULT 0,
  taxes DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  
  -- Purchaser Information
  purchaser_id UUID REFERENCES auth.users(id),
  purchaser_name TEXT,
  purchaser_email TEXT,
  purchaser_phone TEXT,
  
  -- Attendee Information (if different from purchaser)
  attendee_name TEXT,
  attendee_email TEXT,
  attendee_phone TEXT,
  
  -- Seating (if applicable)
  section TEXT,
  row TEXT,
  seat_number TEXT,
  
  -- Transaction
  transaction_id UUID REFERENCES transactions(id),
  purchase_date TIMESTAMPTZ,
  
  -- Status
  ticket_status TEXT NOT NULL DEFAULT 'active' CHECK (ticket_status IN (
    'reserved',
    'active',
    'transferred',
    'checked_in',
    'cancelled',
    'refunded',
    'voided'
  )),
  
  -- Check-in
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id),
  check_in_location TEXT,
  
  -- Transfer
  transferred_to TEXT,
  transferred_at TIMESTAMPTZ,
  
  -- Cancellation/Refund
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  
  -- Notes
  special_requirements TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ticket_tiers_event ON ticket_tiers(event_id);
CREATE INDEX idx_ticket_tiers_type ON ticket_tiers(tier_type);
CREATE INDEX idx_ticket_tiers_active ON ticket_tiers(is_active);

CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_tier ON tickets(tier_id);
CREATE INDEX idx_tickets_status ON tickets(ticket_status);
CREATE INDEX idx_tickets_purchaser ON tickets(purchaser_id);
CREATE INDEX idx_tickets_transaction ON tickets(transaction_id);
CREATE INDEX idx_tickets_barcode ON tickets(barcode);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);

CREATE INDEX idx_transactions_event ON transactions(event_id);
CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(completed_at);
CREATE INDEX idx_transactions_number ON transactions(transaction_number);

-- RLS Policies
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Ticket Tiers: Public can view active tiers for public events
CREATE POLICY "Public can view active ticket tiers"
  ON ticket_tiers FOR SELECT
  USING (
    is_active = true
    AND event_id IN (
      SELECT id FROM events WHERE is_public = true
    )
  );

-- Ticket Tiers: Event managers can manage tiers
CREATE POLICY "Event managers can manage ticket tiers"
  ON ticket_tiers FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'finance_manager')
      )
    )
  );

-- Tickets: Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (
    purchaser_id = auth.uid()
    OR attendee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Tickets: Event staff can view all tickets for their events
CREATE POLICY "Event staff can view event tickets"
  ON tickets FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Tickets: Event staff can manage tickets
CREATE POLICY "Event staff can manage tickets"
  ON tickets FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'staff_member')
      )
    )
  );

-- Transactions: Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (
    customer_id = auth.uid()
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Transactions: Finance staff can view organization transactions
CREATE POLICY "Finance staff can view organization transactions"
  ON transactions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'finance_manager', 'event_manager')
    )
  );

-- Transactions: Finance staff can manage transactions
CREATE POLICY "Finance staff can manage transactions"
  ON transactions FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'finance_manager')
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_ticket_tiers_updated_at
  BEFORE UPDATE ON ticket_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
