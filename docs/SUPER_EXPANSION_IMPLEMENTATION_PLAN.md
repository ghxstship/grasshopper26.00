# GVTEWAY Full-Stack Event Production Platform with Integrated KPI System

## PROJECT OVERVIEW
Build a complete, enterprise-grade event production project management platform that captures ALL operational data across the entire event lifecycle, feeding a comprehensive KPI reporting and analytics system. This is the foundational data infrastructure that powers real-time insights for live entertainment production.

## CRITICAL CONSTRAINTS
- **MANDATORY**: Use existing atomic design system components exclusively
- **MANDATORY**: GHXSTSHIP Contemporary Minimal Pop Art aesthetic
- **MANDATORY**: Every data point must be captured for KPI calculation
- **MANDATORY**: Real-time data synchronization across all modules
- **ZERO TOLERANCE**: No incomplete features, no placeholder data, no "TODO" comments

---

## PART 1: COMPREHENSIVE DATABASE ARCHITECTURE

### Core Event & Organization Schema
```sql
-- ============================================================================
-- ORGANIZATIONS & USERS
-- ============================================================================

CREATE TABLE organizations (
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

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  display_name TEXT,
  
  -- Profile
  avatar_url TEXT,
  phone TEXT,
  mobile TEXT,
  bio TEXT,
  
  -- Professional Details
  title TEXT,
  department TEXT,
  specialization TEXT[],
  years_experience INTEGER,
  certifications JSONB,
  
  -- Preferences
  timezone TEXT DEFAULT 'America/New_York',
  language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- ============================================================================
-- EVENTS & EVENT TYPES
-- ============================================================================

CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  type_name TEXT NOT NULL,
  type_slug TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  color_hex TEXT,
  
  -- Default Settings
  default_capacity INTEGER,
  default_duration_hours DECIMAL,
  typical_budget_range JSONB, -- {min: 0, max: 0}
  
  -- Required Fields Configuration
  required_fields JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '[]',
  
  -- Workflow Templates
  default_task_template_id UUID,
  default_timeline_template_id UUID,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, type_slug)
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_type_id UUID REFERENCES event_types(id),
  
  -- Basic Information
  event_name TEXT NOT NULL,
  event_slug TEXT NOT NULL,
  event_code TEXT, -- Internal tracking code
  description TEXT,
  tagline TEXT,
  
  -- Dates & Times
  event_start_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ NOT NULL,
  doors_open_time TIMESTAMPTZ,
  show_start_time TIMESTAMPTZ,
  show_end_time TIMESTAMPTZ,
  load_in_start TIMESTAMPTZ,
  load_out_end TIMESTAMPTZ,
  timezone TEXT,
  
  -- Venue Information
  venue_id UUID REFERENCES venues(id),
  venue_name TEXT, -- Denormalized for quick access
  
  -- Capacity & Attendance
  total_capacity INTEGER NOT NULL,
  general_admission_capacity INTEGER,
  vip_capacity INTEGER,
  reserved_seating_capacity INTEGER,
  standing_capacity INTEGER,
  target_attendance INTEGER,
  expected_attendance INTEGER,
  actual_attendance INTEGER,
  
  -- Financial Targets
  target_revenue DECIMAL(12,2),
  target_profit_margin DECIMAL(5,2),
  break_even_attendance INTEGER,
  
  -- Status & Phase
  event_status TEXT NOT NULL DEFAULT 'planning' CHECK (event_status IN (
    'planning',
    'budgeting',
    'confirmed',
    'in_production',
    'day_of_show',
    'completed',
    'cancelled',
    'postponed'
  )),
  
  production_phase TEXT CHECK (production_phase IN (
    'pre_production',
    'production',
    'post_production'
  )),
  
  -- Visibility
  is_public BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Marketing
  event_website_url TEXT,
  ticket_url TEXT,
  promotional_image_url TEXT,
  poster_image_url TEXT,
  
  -- Client/Partner Information
  client_organization_id UUID REFERENCES organizations(id),
  client_contact_name TEXT,
  client_contact_email TEXT,
  client_contact_phone TEXT,
  
  -- Team
  event_manager_id UUID REFERENCES users(id),
  production_coordinator_id UUID REFERENCES users(id),
  
  -- Custom Fields
  custom_fields JSONB DEFAULT '{}',
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, event_slug)
);

CREATE INDEX idx_events_org ON events(organization_id);
CREATE INDEX idx_events_status ON events(event_status);
CREATE INDEX idx_events_dates ON events(event_start_date, event_end_date);
CREATE INDEX idx_events_venue ON events(venue_id);

-- ============================================================================
-- VENUES
-- ============================================================================

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Information
  venue_name TEXT NOT NULL,
  venue_slug TEXT NOT NULL,
  venue_type TEXT CHECK (venue_type IN (
    'arena',
    'stadium',
    'theater',
    'club',
    'outdoor',
    'conference_center',
    'hotel',
    'private_space',
    'other'
  )),
  
  -- Contact Information
  primary_contact_name TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  website_url TEXT,
  
  -- Address
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Capacity & Specifications
  max_capacity INTEGER NOT NULL,
  standing_capacity INTEGER,
  seated_capacity INTEGER,
  vip_capacity INTEGER,
  backstage_capacity INTEGER,
  
  -- Physical Specifications
  total_square_footage INTEGER,
  ceiling_height_feet DECIMAL,
  stage_dimensions JSONB, -- {width: 0, depth: 0, height: 0}
  loading_dock_info TEXT,
  parking_spaces INTEGER,
  accessible_parking_spaces INTEGER,
  
  -- Technical Specifications
  power_available_amps INTEGER,
  sound_system_specs JSONB,
  lighting_grid_specs JSONB,
  video_capabilities JSONB,
  wifi_available BOOLEAN DEFAULT false,
  wifi_capacity INTEGER,
  
  -- Amenities
  has_green_rooms BOOLEAN DEFAULT false,
  green_room_count INTEGER,
  has_catering_kitchen BOOLEAN DEFAULT false,
  has_bar BOOLEAN DEFAULT false,
  bar_count INTEGER,
  has_coat_check BOOLEAN DEFAULT false,
  restroom_count INTEGER,
  accessible_restroom_count INTEGER,
  
  -- Restrictions & Requirements
  noise_restrictions TEXT,
  curfew_time TIME,
  alcohol_license TEXT,
  insurance_required BOOLEAN DEFAULT true,
  union_required BOOLEAN DEFAULT false,
  security_required BOOLEAN DEFAULT true,
  
  -- Costs
  base_rental_cost DECIMAL(10,2),
  overtime_hourly_rate DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  cleaning_fee DECIMAL(10,2),
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  booking_lead_time_days INTEGER DEFAULT 30,
  
  -- Media
  photos JSONB DEFAULT '[]',
  floor_plan_url TEXT,
  seating_chart_url TEXT,
  
  -- Ratings
  accessibility_rating INTEGER CHECK (accessibility_rating BETWEEN 1 AND 5),
  technical_rating INTEGER CHECK (technical_rating BETWEEN 1 AND 5),
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, venue_slug)
);

CREATE INDEX idx_venues_org ON venues(organization_id);
CREATE INDEX idx_venues_location ON venues(city, state);
CREATE INDEX idx_venues_capacity ON venues(max_capacity);

-- ============================================================================
-- BUDGETS & FINANCIAL TRACKING
-- ============================================================================

CREATE TABLE budget_categories (
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

-- Seed Default Budget Categories
INSERT INTO budget_categories (organization_id, category_name, category_slug, budget_type, is_default) VALUES
-- Revenue Categories
(NULL, 'Ticket Sales', 'ticket-sales', 'revenue', true),
(NULL, 'VIP Packages', 'vip-packages', 'revenue', true),
(NULL, 'Sponsorships', 'sponsorships', 'revenue', true),
(NULL, 'Merchandise', 'merchandise', 'revenue', true),
(NULL, 'Food & Beverage', 'food-beverage', 'revenue', true),
(NULL, 'Parking', 'parking', 'revenue', true),
(NULL, 'Media Rights', 'media-rights', 'revenue', true),
-- Expense Categories
(NULL, 'Venue Rental', 'venue-rental', 'expense', true),
(NULL, 'Talent/Performers', 'talent', 'expense', true),
(NULL, 'Production', 'production', 'expense', true),
(NULL, 'Audio/Visual', 'audio-visual', 'expense', true),
(NULL, 'Lighting', 'lighting', 'expense', true),
(NULL, 'Staging', 'staging', 'expense', true),
(NULL, 'Marketing', 'marketing', 'expense', true),
(NULL, 'Staffing', 'staffing', 'expense', true),
(NULL, 'Security', 'security', 'expense', true),
(NULL, 'Insurance', 'insurance', 'expense', true),
(NULL, 'Permits & Licenses', 'permits-licenses', 'expense', true),
(NULL, 'Catering', 'catering', 'expense', true),
(NULL, 'Transportation', 'transportation', 'expense', true),
(NULL, 'Accommodations', 'accommodations', 'expense', true),
(NULL, 'Contingency', 'contingency', 'expense', true);

CREATE TABLE budgets (
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
  profit_variance DECIMAL(12,2) GENERATED ALWAYS AS (total_profit_actual - total_profit_budgeted) STORED,
  
  -- Status
  budget_status TEXT DEFAULT 'draft' CHECK (budget_status IN ('draft', 'pending_approval', 'approved', 'locked', 'closed')),
  is_baseline BOOLEAN DEFAULT false,
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Lock
  locked_by UUID REFERENCES users(id),
  locked_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_line_items (
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
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_line_items_budget ON budget_line_items(budget_id);
CREATE INDEX idx_budget_line_items_category ON budget_line_items(category_id);
CREATE INDEX idx_budget_line_items_vendor ON budget_line_items(vendor_id);

-- ============================================================================
-- TICKETING & SALES
-- ============================================================================

CREATE TABLE ticket_tiers (
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

CREATE TABLE tickets (
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
  purchaser_id UUID REFERENCES users(id),
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
  checked_in_by UUID REFERENCES users(id),
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

CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_tier ON tickets(tier_id);
CREATE INDEX idx_tickets_status ON tickets(ticket_status);
CREATE INDEX idx_tickets_purchaser ON tickets(purchaser_id);
CREATE INDEX idx_tickets_transaction ON tickets(transaction_id);

-- ============================================================================
-- TRANSACTIONS & PAYMENTS
-- ============================================================================

CREATE TABLE transactions (
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
  customer_id UUID REFERENCES users(id),
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
  refunded_by UUID REFERENCES users(id),
  
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

CREATE INDEX idx_transactions_event ON transactions(event_id);
CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_status ON transactions(transaction_status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(completed_at);

-- ============================================================================
-- PROJECT MANAGEMENT & TASKS
-- ============================================================================

CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  phase_name TEXT NOT NULL,
  phase_slug TEXT NOT NULL,
  description TEXT,
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  
  -- Progress
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Display
  display_order INTEGER,
  color_hex TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, phase_slug)
);

CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id),
  
  milestone_name TEXT NOT NULL,
  description TEXT,
  
  -- Timeline
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Progress
  is_critical BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  
  -- Dependencies
  depends_on_milestone_ids UUID[],
  blocks_milestone_ids UUID[],
  
  -- Owner
  owner_id UUID REFERENCES users(id),
  
  -- Display
  display_order INTEGER,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  color_hex TEXT,
  
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, category_slug)
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id),
  milestone_id UUID REFERENCES project_milestones(id),
  category_id UUID REFERENCES task_categories(id),
  parent_task_id UUID REFERENCES tasks(id),
  
  -- Task Details
  task_name TEXT NOT NULL,
  description TEXT,
  
  -- Priority & Status
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  task_status TEXT NOT NULL DEFAULT 'todo' CHECK (task_status IN (
    'todo',
    'in_progress',
    'blocked',
    'in_review',
    'completed',
    'cancelled',
    'deferred'
  )),
  
  -- Timeline
  start_date DATE,
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Time Tracking
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2) DEFAULT 0,
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Dependencies
  depends_on_task_ids UUID[],
  blocks_task_ids UUID[],
  
  -- Completion
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Recurrence (for recurring tasks)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  recurrence_end_date DATE,
  
  -- Checklist
  checklist JSONB DEFAULT '[]',
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_event ON tasks(event_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(task_status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_phase ON tasks(phase_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);

-- ============================================================================
-- TIME TRACKING
-- ============================================================================

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Time Details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Work Description
  description TEXT,
  work_type TEXT CHECK (work_type IN ('regular', 'overtime', 'double_time', 'travel')),
  
  -- Billing
  is_billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Approval
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Status
  entry_status TEXT DEFAULT 'draft' CHECK (entry_status IN ('draft', 'submitted', 'approved', 'rejected', 'invoiced')),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_event ON time_entries(event_id);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(start_time);

-- ============================================================================
-- VENDORS & CONTRACTS
-- ============================================================================

CREATE TABLE vendor_categories (
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
INSERT INTO vendor_categories (organization_id, category_name, category_slug) VALUES
(NULL, 'Audio/Visual', 'audio-visual'),
(NULL, 'Lighting', 'lighting'),
(NULL, 'Staging', 'staging'),
(NULL, 'Catering', 'catering'),
(NULL, 'Security', 'security'),
(NULL, 'Transportation', 'transportation'),
(NULL, 'Accommodations', 'accommodations'),
(NULL, 'Photography/Video', 'photography-video'),
(NULL, 'Printing/Signage', 'printing-signage'),
(NULL, 'Rental Equipment', 'rental-equipment'),
(NULL, 'Staffing', 'staffing'),
(NULL, 'Talent/Performers', 'talent'),
(NULL, 'Marketing/PR', 'marketing-pr'),
(NULL, 'Insurance', 'insurance'),
(NULL, 'Legal', 'legal');

CREATE TABLE vendors (
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
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, vendor_slug)
);

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_category ON vendors(category_id);
CREATE INDEX idx_vendors_status ON vendors(vendor_status);

CREATE TABLE contracts (
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
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_event ON contracts(event_id);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id);
CREATE INDEX idx_contracts_status ON contracts(contract_status);

-- ============================================================================
-- DELIVERABLES & VENDOR MANAGEMENT
-- ============================================================================

CREATE TABLE vendor_deliverables (
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
  quality_checked_by UUID REFERENCES users(id),
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
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliverables_event ON vendor_deliverables(event_id);
CREATE INDEX idx_deliverables_vendor ON vendor_deliverables(vendor_id);
CREATE INDEX idx_deliverables_status ON vendor_deliverables(deliverable_status);
CREATE INDEX idx_deliverables_due_date ON vendor_deliverables(due_date);

-- ============================================================================
-- PRODUCTION ADVANCING & LOGISTICS
-- ============================================================================

CREATE TABLE production_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  schedule_name TEXT NOT NULL,
  schedule_type TEXT CHECK (schedule_type IN ('load_in', 'rehearsal', 'show', 'load_out', 'general')),
  
  -- Timeline
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER,
  
  -- Location
  location TEXT,
  venue_area TEXT,
  
  -- Description
  description TEXT,
  activities TEXT[],
  
  -- Resources Required
  staff_required INTEGER,
  equipment_required TEXT[],
  
  -- Status
  schedule_status TEXT DEFAULT 'planned' CHECK (schedule_status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  
  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_logistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Load In/Out Times
  load_in_start TIMESTAMPTZ,
  load_in_end TIMESTAMPTZ,
  load_out_start TIMESTAMPTZ,
  load_out_end TIMESTAMPTZ,
  
  -- Setup/Strike Times
  planned_setup_hours DECIMAL(5,2),
  actual_setup_hours DECIMAL(5,2),
  planned_strike_hours DECIMAL(5,2),
  actual_strike_hours DECIMAL(5,2),
  
  -- Venue Access
  venue_access_start TIMESTAMPTZ,
  venue_access_end TIMESTAMPTZ,
  
  -- Parking & Loading
  loading_dock_info TEXT,
  parking_instructions TEXT,
  truck_count INTEGER,
  vehicle_types TEXT[],
  
  -- Power & Technical
  power_requirements TEXT,
  internet_requirements TEXT,
  special_equipment TEXT[],
  
  -- Catering & Hospitality
  crew_meal_count INTEGER,
  crew_meal_time TIME,
  green_room_setup TEXT,
  hospitality_requirements TEXT,
  
  -- Safety & Security
  safety_briefing_time TIME,
  emergency_contacts JSONB,
  security_requirements TEXT,
  
  -- Weather Contingency
  weather_contingency_plan TEXT,
  backup_date DATE,
  
  -- Notes
  special_instructions TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STAFF SCHEDULING & ASSIGNMENTS
-- ============================================================================

CREATE TABLE staff_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  position_name TEXT NOT NULL,
  position_slug TEXT NOT NULL,
  description TEXT,
  
  -- Requirements
  required_certifications TEXT[],
  required_skills TEXT[],
  experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'advanced', 'expert')),
  
  -- Compensation
  default_hourly_rate DECIMAL(10,2),
  overtime_rate_multiplier DECIMAL(3,2) DEFAULT 1.5,
  
  -- Display
  display_order INTEGER,
  color_hex TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, position_slug)
);

CREATE TABLE staff_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position_id UUID REFERENCES staff_positions(id),
  
  -- Assignment Details
  assignment_type TEXT CHECK (assignment_type IN ('full_event', 'shift', 'task_specific')),
  
  -- Schedule
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  
  -- Break Times
  scheduled_break_minutes INTEGER DEFAULT 0,
  actual_break_minutes INTEGER DEFAULT 0,
  
  -- Location
  assigned_location TEXT,
  assigned_area TEXT,
  
  -- Compensation
  hourly_rate DECIMAL(10,2),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  total_cost DECIMAL(10,2),
  
  -- Status
  assignment_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (assignment_status IN (
    'scheduled',
    'confirmed',
    'checked_in',
    'on_break',
    'checked_out',
    'no_show',
    'cancelled'
  )),
  
  -- Check In/Out
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES users(id),
  checked_out_at TIMESTAMPTZ,
  checked_out_by UUID REFERENCES users(id),
  
  -- Confirmation
  confirmed_by_staff BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  
  -- Special Requirements
  special_requirements TEXT,
  uniform_requirements TEXT,
  meal_provided BOOLEAN DEFAULT false,
  
  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_assignments_event ON staff_assignments(event_id);
CREATE INDEX idx_staff_assignments_user ON staff_assignments(user_id);
CREATE INDEX idx_staff_assignments_position ON staff_assignments(position_id);
CREATE INDEX idx_staff_assignments_status ON staff_assignments(assignment_status);
CREATE INDEX idx_staff_assignments_schedule ON staff_assignments(scheduled_start, scheduled_end);

-- ============================================================================
-- ATTENDEE CHECK-IN & TRACKING
-- ============================================================================

CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  
  -- Check-in Details
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_method TEXT CHECK (check_in_method IN ('qr_scan', 'barcode_scan', 'manual', 'nfc', 'facial_recognition')),
  
  -- Location
  check_in_gate TEXT,
  check_in_location TEXT,
  
  -- Staff
  checked_in_by UUID REFERENCES users(id),
  
  -- Device
  device_id TEXT,
  device_type TEXT,
  
  -- Attendee Info (denormalized for quick access)
  attendee_name TEXT,
  attendee_email TEXT,
  ticket_tier TEXT,
  
  -- Status
  check_in_status TEXT DEFAULT 'completed' CHECK (check_in_status IN ('completed', 'duplicate', 'invalid', 'flagged')),
  
  -- Issues
  had_issue BOOLEAN DEFAULT false,
  issue_description TEXT,
  issue_resolved BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_check_ins_event ON check_ins(event_id);
CREATE INDEX idx_check_ins_ticket ON check_ins(ticket_id);
CREATE INDEX idx_check_ins_time ON check_ins(checked_in_at);
CREATE INDEX idx_check_ins_status ON check_ins(check_in_status);

-- ============================================================================
-- MARKETING CAMPAIGNS
-- ============================================================================

CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Campaign Details
  campaign_name TEXT NOT NULL,
  campaign_slug TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('email', 'social_media', 'paid_ads', 'influencer', 'pr', 'partnership', 'mixed')),
  
  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Budget
  budgeted_amount DECIMAL(10,2),
  actual_spend DECIMAL(10,2) DEFAULT 0,
  
  -- Goals
  target_reach INTEGER,
  target_engagement INTEGER,
  target_conversions INTEGER,
  target_revenue DECIMAL(10,2),
  
  -- Performance Metrics
  actual_reach INTEGER DEFAULT 0,
  actual_engagement INTEGER DEFAULT 0,
  actual_conversions INTEGER DEFAULT 0,
  actual_revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Engagement Breakdown
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  -- Conversion Metrics
  click_through_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  cost_per_click DECIMAL(10,2),
  cost_per_conversion DECIMAL(10,2),
  return_on_ad_spend DECIMAL(5,2),
  
  -- Content
  campaign_description TEXT,
  key_messages TEXT[],
  target_audience TEXT,
  creative_assets JSONB DEFAULT '[]',
  
  -- Status
  campaign_status TEXT NOT NULL DEFAULT 'planning' CHECK (campaign_status IN (
    'planning',
    'scheduled',
    'active',
    'paused',
    'completed',
    'cancelled'
  )),
  
  -- Owner
  campaign_manager_id UUID REFERENCES users(id),
  
  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, campaign_slug)
);

CREATE INDEX idx_campaigns_event ON marketing_campaigns(event_id);
CREATE INDEX idx_campaigns_status ON marketing_campaigns(campaign_status);
CREATE INDEX idx_campaigns_dates ON marketing_campaigns(start_date, end_date);

CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketing_campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Email Details
  email_subject TEXT NOT NULL,
  email_preview_text TEXT,
  email_body TEXT NOT NULL,
  
  -- Recipients
  recipient_list_id UUID,
  total_recipients INTEGER,
  
  -- Sending
  scheduled_send_time TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Delivery Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  spam_complaints INTEGER DEFAULT 0,
  
  -- Calculated Metrics
  delivery_rate DECIMAL(5,2),
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  click_to_open_rate DECIMAL(5,2),
  unsubscribe_rate DECIMAL(5,2),
  
  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  test_variant TEXT,
  
  -- Status
  email_status TEXT NOT NULL DEFAULT 'draft' CHECK (email_status IN (
    'draft',
    'scheduled',
    'sending',
    'sent',
    'cancelled'
  )),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketing_campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Post Details
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube')),
  post_type TEXT CHECK (post_type IN ('post', 'story', 'reel', 'video', 'live')),
  post_content TEXT NOT NULL,
  
  -- Media
  media_urls JSONB DEFAULT '[]',
  media_type TEXT CHECK (media_type IN ('image', 'video', 'carousel', 'link')),
  
  -- Scheduling
  scheduled_publish_time TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Engagement Metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Calculated Metrics
  engagement_rate DECIMAL(5,2),
  
  -- Status
  post_status TEXT NOT NULL DEFAULT 'draft' CHECK (post_status IN (
    'draft',
    'scheduled',
    'published',
    'cancelled'
  )),
  
  -- Platform-Specific IDs
  platform_post_id TEXT,
  platform_url TEXT,
  
  -- Metadata
  hashtags TEXT[],
  mentions TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brand_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Source
  source_platform TEXT NOT NULL,
  source_url TEXT,
  source_author TEXT,
  
  -- Content
  mention_text TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(3,2),
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Metadata
  mentioned_at TIMESTAMPTZ NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SURVEYS & FEEDBACK
-- ============================================================================

CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Survey Details
  survey_name TEXT NOT NULL,
  survey_type TEXT CHECK (survey_type IN ('pre_event', 'post_event', 'nps', 'satisfaction', 'custom')),
  description TEXT,
  
  -- Questions
  questions JSONB NOT NULL,
  
  -- Distribution
  send_to TEXT CHECK (send_to IN ('all_attendees', 'ticket_purchasers', 'vip_only', 'custom_list')),
  send_time TIMESTAMPTZ,
  
  -- Response Tracking
  total_sent INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2),
  
  -- Average Scores
  average_rating DECIMAL(3,2),
  nps_score DECIMAL(5,2),
  
  -- Status
  survey_status TEXT NOT NULL DEFAULT 'draft' CHECK (survey_status IN (
    'draft',
    'scheduled',
    'active',
    'closed'
  )),
  
  -- Timeline
  open_date TIMESTAMPTZ,
  close_date TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id),
  
  -- Respondent (optional)
  respondent_id UUID REFERENCES users(id),
  respondent_email TEXT,
  
  -- Responses
  answers JSONB NOT NULL,
  
  -- Metadata
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_to_complete_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INCIDENTS & ISSUES
-- ============================================================================

CREATE TABLE incident_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  type_name TEXT NOT NULL,
  type_slug TEXT NOT NULL,
  severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  
  response_protocol TEXT,
  escalation_required BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, type_slug)
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  incident_type_id UUID REFERENCES incident_types(id),
  
  -- Incident Details
  incident_title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Location & Time
  incident_location TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  
  -- People Involved
  reported_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  people_involved TEXT[],
  
  -- Response
  response_actions TEXT,
  resolution_notes TEXT,
  
  -- Medical/Emergency
  medical_attention_required BOOLEAN DEFAULT false,
  medical_response_time_minutes INTEGER,
  emergency_services_called BOOLEAN DEFAULT false,
  
  -- Status
  incident_status TEXT NOT NULL DEFAULT 'open' CHECK (incident_status IN (
    'open',
    'investigating',
    'in_progress',
    'resolved',
    'closed'
  )),
  
  -- Timestamps
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Follow-up
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_event ON incidents(event_id);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(incident_status);
CREATE INDEX idx_incidents_occurred ON incidents(occurred_at);

-- ============================================================================
-- EQUIPMENT & INVENTORY
-- ============================================================================

CREATE TABLE equipment_categories (
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

CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES equipment_categories(id),
  
  -- Equipment Details
  equipment_name TEXT NOT NULL,
  equipment_slug TEXT NOT NULL,
  model_number TEXT,
  serial_number TEXT,
  manufacturer TEXT,
  
  -- Specifications
  specifications JSONB,
  
  -- Ownership
  ownership_type TEXT CHECK (ownership_type IN ('owned', 'rented', 'borrowed')),
  
  -- Condition
  condition_status TEXT CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'needs_repair', 'out_of_service')),
  last_maintenance_date DATE,
  next_maintenance_due DATE,
  
  -- Value
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  current_value DECIMAL(10,2),
  rental_rate_per_day DECIMAL(10,2),
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  current_location TEXT,
  
  -- Images
  primary_image_url TEXT,
  additional_images JSONB DEFAULT '[]',
  
  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, equipment_slug)
);

CREATE TABLE equipment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Assignment Details
  assigned_to UUID REFERENCES users(id),
  
  -- Timeline
  assigned_from TIMESTAMPTZ NOT NULL,
  assigned_until TIMESTAMPTZ NOT NULL,
  checked_out_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  
  -- Condition
  condition_at_checkout TEXT,
  condition_at_checkin TEXT,
  
  -- Status
  assignment_status TEXT NOT NULL DEFAULT 'reserved' CHECK (assignment_status IN (
    'reserved',
    'checked_out',
    'in_use',
    'checked_in',
    'cancelled'
  )),
  
  -- Notes
  notes TEXT,
  damage_report TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS & FILE MANAGEMENT
-- ============================================================================

CREATE TABLE document_categories (
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

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES document_categories(id),
  
  -- Document Details
  document_name TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('contract', 'invoice', 'receipt', 'permit', 'insurance', 'rider', 'floorplan', 'schedule', 'runsheet', 'other')),
  description TEXT,
  
  -- File Information
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  file_type TEXT,
  mime_type TEXT,
  
  -- Version Control
  version_number INTEGER DEFAULT 1,
  is_latest_version BOOLEAN DEFAULT true,
  supersedes_document_id UUID REFERENCES documents(id),
  
  -- Access Control
  is_public BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'team' CHECK (access_level IN ('private', 'team', 'organization', 'public')),
  
  -- Status
  document_status TEXT DEFAULT 'draft' CHECK (document_status IN ('draft', 'review', 'approved', 'archived')),
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Related Entities
  related_contract_id UUID REFERENCES contracts(id),
  related_vendor_id UUID REFERENCES vendors(id),
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_event ON documents(event_id);
CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_category ON documents(category_id);

-- ============================================================================
-- COMMUNICATIONS & NOTES
-- ============================================================================

CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Communication Details
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'call', 'meeting', 'text', 'in_person', 'other')),
  subject TEXT NOT NULL,
  body TEXT,
  
  -- Participants
  from_user_id UUID REFERENCES users(id),
  to_user_ids UUID[],
  cc_user_ids UUID[],
  
  -- External Participants
  external_recipients TEXT[],
  
  -- Related Entities
  related_vendor_id UUID REFERENCES vendors(id),
  related_contract_id UUID REFERENCES contracts(id),
  related_task_id UUID REFERENCES tasks(id),
  
  -- Status
  communication_status TEXT DEFAULT 'sent' CHECK (communication_status IN ('draft', 'sent', 'delivered', 'read', 'failed')),
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communications_event ON communications(event_id);
CREATE INDEX idx_communications_from ON communications(from_user_id);
CREATE INDEX idx_communications_type ON communications(communication_type);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Note Details
  note_title TEXT,
  note_content TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('general', 'meeting', 'phone_call', 'observation', 'decision', 'action_item')),
  
  -- Related Entities
  related_task_id UUID REFERENCES tasks(id),
  related_vendor_id UUID REFERENCES vendors(id),
  related_user_id UUID REFERENCES users(id),
  
  -- Visibility
  is_private BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Tags
  tags TEXT[],
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_event ON notes(event_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Details
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related Entity
  related_entity_type TEXT,
  related_entity_id UUID,
  
  -- Action
  action_url TEXT,
  action_text TEXT,
  
  -- Data
  data JSONB DEFAULT '{}',
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Delivery
  delivery_method TEXT[] DEFAULT ARRAY['in_app'],
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  sms_sent BOOLEAN DEFAULT false,
  sms_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- Activity Details
  activity_type TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  
  -- Entity
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  
  -- Changes (for updates)
  changes JSONB,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_event ON activity_log(event_id, created_at DESC);
CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add similar triggers for all other tables with updated_at...

-- ============================================================================
-- ROW LEVEL SECURITY SETUP
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies (expand for all tables and roles)
CREATE POLICY events_select_policy ON events
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY tasks_select_policy ON tasks
  FOR SELECT
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN user_organizations uo ON e.organization_id = uo.organization_id
      WHERE uo.user_id = auth.uid()
    )
    OR assigned_to = auth.uid()
  );

-- Add comprehensive RLS policies for all 11 user roles...
```

---

## PART 2: KPI DATA MAPPING & CALCULATION FUNCTIONS

### SQL Functions for KPI Calculations
```sql
-- ============================================================================
-- KPI CALCULATION FUNCTIONS
-- ============================================================================

-- Financial KPIs
CREATE OR REPLACE FUNCTION calculate_total_event_revenue(p_event_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM transactions
    WHERE event_id = p_event_id
    AND transaction_status = 'completed'
    AND transaction_type IN ('ticket_sale', 'merchandise', 'food_beverage', 'parking', 'sponsorship')
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_total_event_costs(p_event_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(actual_amount), 0)
    FROM budget_line_items bli
    JOIN budgets b ON bli.budget_id = b.id
    WHERE b.event_id = p_event_id
    AND bli.item_type = 'expense'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_profit_margin(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_revenue DECIMAL;
  v_costs DECIMAL;
BEGIN
  v_revenue := calculate_total_event_revenue(p_event_id);
  v_costs := calculate_total_event_costs(p_event_id);
  
  IF v_revenue = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ((v_revenue - v_costs) / v_revenue) * 100;
END;
$$ LANGUAGE plpgsql;

-- Attendance KPIs
CREATE OR REPLACE FUNCTION calculate_attendance_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_checked_in INTEGER;
  v_tickets_sold INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_checked_in
  FROM check_ins
  WHERE event_id = p_event_id
  AND check_in_status = 'completed';
  
  SELECT COUNT(*) INTO v_tickets_sold
  FROM tickets
  WHERE event_id = p_event_id
  AND ticket_status NOT IN ('cancelled', 'refunded');
  
  IF v_tickets_sold = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (v_checked_in::DECIMAL / v_tickets_sold) * 100;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_sell_through_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_tickets_sold INTEGER;
  v_capacity INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_tickets_sold
  FROM tickets
  WHERE event_id = p_event_id
  AND ticket_status NOT IN ('cancelled', 'refunded');
  
  SELECT total_capacity INTO v_capacity
  FROM events
  WHERE id = p_event_id;
  
  IF v_capacity = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (v_tickets_sold::DECIMAL / v_capacity) * 100;
END;
$$ LANGUAGE plpgsql;

-- Operational KPIs
CREATE OR REPLACE FUNCTION calculate_task_completion_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_completed INTEGER;
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM tasks
  WHERE event_id = p_event_id;
  
  SELECT COUNT(*) INTO v_completed
  FROM tasks
  WHERE event_id = p_event_id
  AND task_status = 'completed';
  
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (v_completed::DECIMAL / v_total) * 100;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_schedule_adherence_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_on_time INTEGER;
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM project_milestones
  WHERE event_id = p_event_id
  AND is_completed = true;
  
  SELECT COUNT(*) INTO v_on_time
  FROM project_milestones
  WHERE event_id = p_event_id
  AND is_completed = true
  AND completed_at <= due_date;
  
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (v_on_time::DECIMAL / v_total) * 100;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_vendor_response_time(p_event_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - requested_at)) / 3600)
    FROM vendor_deliverables
    WHERE event_id = p_event_id
    AND delivered_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Marketing KPIs
CREATE OR REPLACE FUNCTION calculate_email_ctr(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total_clicks INTEGER;
  v_total_delivered INTEGER;
BEGIN
  SELECT COALESCE(SUM(emails_clicked), 0), COALESCE(SUM(emails_delivered), 0)
  INTO v_total_clicks, v_total_delivered
  FROM email_campaigns
  WHERE event_id = p_event_id;
  
  IF v_total_delivered = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (v_total_clicks::DECIMAL / v_total_delivered) * 100;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_social_engagement_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total_engagement INTEGER;
  v_total_impressions INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(likes + comments + shares), 0),
    COALESCE(SUM(impressions), 0)
  INTO v_total_engagement, v_total_impressions
  FROM social_media_posts
  WHERE event_id = p_event_id;
  
  IF v_total_impressions = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (v_total_engagement::DECIMAL / v_total_impressions) * 100;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_nps_score(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total_responses INTEGER;
  v_promoters INTEGER;
  v_detractors INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_responses
  FROM survey_responses sr
  JOIN surveys s ON sr.survey_id = s.id
  WHERE s.event_id = p_event_id
  AND s.survey_type = 'nps';
  
  IF v_total_responses = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO v_promoters
  FROM survey_responses sr
  JOIN surveys s ON sr.survey_id = s.id
  WHERE s.event_id = p_event_id
  AND s.survey_type = 'nps'
  AND (sr.answers->>'score')::INTEGER >= 9;
  
  SELECT COUNT(*) INTO v_detractors
  FROM survey_responses sr
  JOIN surveys s ON sr.survey_id = s.id
  WHERE s.event_id = p_event_id
  AND s.survey_type = 'nps'
  AND (sr.answers->>'score')::INTEGER <= 6;
  
  RETURN ((v_promoters::DECIMAL / v_total_responses) - (v_detractors::DECIMAL / v_total_responses)) * 100;
END;
$$ LANGUAGE plpgsql;

-- Safety KPIs
CREATE OR REPLACE FUNCTION calculate_incident_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_incident_count INTEGER;
  v_attendees INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_incident_count
  FROM incidents
  WHERE event_id = p_event_id;
  
  SELECT actual_attendance INTO v_attendees
  FROM events
  WHERE id = p_event_id;
  
  IF v_attendees = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (v_incident_count::DECIMAL / v_attendees) * 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTOMATED KPI TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_kpi_recalculation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into a queue table for async processing
  INSERT INTO kpi_calculation_queue (
    event_id,
    trigger_table,
    trigger_action,
    triggered_at
  ) VALUES (
    COALESCE(NEW.event_id, OLD.event_id),
    TG_TABLE_NAME,
    TG_OP,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER trigger_kpi_on_transaction_change
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION trigger_kpi_recalculation();

CREATE TRIGGER trigger_kpi_on_ticket_change
AFTER INSERT OR UPDATE OR DELETE ON tickets
FOR EACH ROW EXECUTE FUNCTION trigger_kpi_recalculation();

CREATE TRIGGER trigger_kpi_on_task_change
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION trigger_kpi_recalculation();

CREATE TRIGGER trigger_kpi_on_check_in_change
AFTER INSERT OR UPDATE OR DELETE ON check_ins
FOR EACH ROW EXECUTE FUNCTION trigger_kpi_recalculation();

-- Add similar triggers for all KPI-relevant tables...

-- ============================================================================
-- KPI CALCULATION QUEUE
-- ============================================================================

CREATE TABLE kpi_calculation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  trigger_table TEXT NOT NULL,
  trigger_action TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT
);

CREATE INDEX idx_kpi_queue_status ON kpi_calculation_queue(status, triggered_at);
CREATE INDEX idx_kpi_queue_event ON kpi_calculation_queue(event_id);
```

---

## PART 3: BACKEND KPI CALCULATION SERVICE
```typescript
// services/kpi-calculator.ts

import { createClient } from '@supabase/supabase-js'

export class KPICalculator {
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async calculateAllKPIsForEvent(eventId: string) {
    console.log(`Starting KPI calculation for event ${eventId}`)
    
    const kpiCalculations = [
      // Financial KPIs
      this.calculateFinancialKPIs(eventId),
      // Attendance KPIs
      this.calculateAttendanceKPIs(eventId),
      // Operational KPIs
      this.calculateOperationalKPIs(eventId),
      // Marketing KPIs
      this.calculateMarketingKPIs(eventId),
      // Customer Experience KPIs
      this.calculateCustomerExperienceKPIs(eventId),
      // Safety KPIs
      this.calculateSafetyKPIs(eventId),
    ]

    const results = await Promise.allSettled(kpiCalculations)
    
    console.log(`Completed KPI calculation for event ${eventId}`)
    
    return results
  }

  private async calculateFinancialKPIs(eventId: string) {
    // Total Event Revenue
    const { data: revenueData } = await this.supabase.rpc(
      'calculate_total_event_revenue',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'total-event-revenue', revenueData)

    // Total Event Costs
    const { data: costsData } = await this.supabase.rpc(
      'calculate_total_event_costs',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'total-event-costs', costsData)

    // Profit Margin
    const { data: profitMarginData } = await this.supabase.rpc(
      'calculate_profit_margin',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'profit-margin-percentage', profitMarginData)

    // Cost Per Attendee
    const { data: event } = await this.supabase
      .from('events')
      .select('actual_attendance')
      .eq('id', eventId)
      .single()
    
    if (event && event.actual_attendance > 0) {
      const costPerAttendee = costsData / event.actual_attendance
      await this.storeKPIValue(eventId, 'cost-per-attendee', costPerAttendee)
    }

    // ROI
    if (costsData > 0) {
      const roi = ((revenueData - costsData) / costsData) * 100
      await this.storeKPIValue(eventId, 'roi-percentage', roi)
    }
  }

  private async calculateAttendanceKPIs(eventId: string) {
    // Attendance Rate
    const { data: attendanceRate } = await this.supabase.rpc(
      'calculate_attendance_rate',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'attendance-rate', attendanceRate)

    // Sell-Through Rate
    const { data: sellThroughRate } = await this.supabase.rpc(
      'calculate_sell_through_rate',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'sell-through-rate', sellThroughRate)

    // Average Ticket Price
    const { data: avgTicketPrice } = await this.supabase
      .from('tickets')
      .select('final_price')
      .eq('event_id', eventId)
      .not('ticket_status', 'in', '(cancelled,refunded)')
    
    if (avgTicketPrice && avgTicketPrice.length > 0) {
      const avg = avgTicketPrice.reduce((sum, t) => sum + parseFloat(t.final_price), 0) / avgTicketPrice.length
      await this.storeKPIValue(eventId, 'average-ticket-price', avg)
    }

    // Ticket Sales Conversion Rate
    const { data: tickets } = await this.supabase
      .from('tickets')
      .select('id')
      .eq('event_id', eventId)
      .not('ticket_status', 'in', '(cancelled,refunded)')
    
    // This would need page view data from analytics
    // const conversionRate = (tickets.length / totalPageViews) * 100
    // await this.storeKPIValue(eventId, 'ticket-sales-conversion-rate', conversionRate)
  }

  private async calculateOperationalKPIs(eventId: string) {
    // Task Completion Rate
    const { data: taskCompletionRate } = await this.supabase.rpc(
      'calculate_task_completion_rate',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'task-completion-rate', taskCompletionRate)

    // Schedule Adherence Rate
    const { data: scheduleAdherence } = await this.supabase.rpc(
      'calculate_schedule_adherence_rate',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'schedule-adherence-rate', scheduleAdherence)

    // Vendor Response Time
    const { data: vendorResponseTime } = await this.supabase.rpc(
      'calculate_vendor_response_time',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'vendor-response-time', vendorResponseTime)

    // Staff-to-Attendee Ratio
    const { data: staffAssignments } = await this.supabase
      .from('staff_assignments')
      .select('id')
      .eq('event_id', eventId)
    
    const { data: event } = await this.supabase
      .from('events')
      .select('actual_attendance')
      .eq('id', eventId)
      .single()
    
    if (staffAssignments && event && event.actual_attendance > 0) {
      const ratio = staffAssignments.length / event.actual_attendance
      await this.storeKPIValue(eventId, 'staff-to-attendee-ratio', ratio)
    }

    // Setup Time Efficiency
    const { data: logistics } = await this.supabase
      .from('event_logistics')
      .select('planned_setup_hours, actual_setup_hours')
      .eq('event_id', eventId)
      .single()
    
    if (logistics && logistics.actual_setup_hours > 0) {
      const efficiency = (logistics.planned_setup_hours / logistics.actual_setup_hours) * 100
      await this.storeKPIValue(eventId, 'setup-time-efficiency', efficiency)
    }
  }

  private async calculateMarketingKPIs(eventId: string) {
    // Email CTR
    const { data: emailCTR } = await this.supabase.rpc(
      'calculate_email_ctr',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'email-campaign-ctr', emailCTR)

    // Social Media Engagement Rate
    const { data: socialEngagement } = await this.supabase.rpc(
      'calculate_social_engagement_rate',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'social-media-engagement-rate', socialEngagement)

    // NPS
    const { data: npsScore } = await this.supabase.rpc(
      'calculate_nps_score',
      { p_event_id: eventId }
    )
    
    await this.storeKPIValue(eventId, 'net-promoter-score', npsScore)

    // Brand Mention Velocity
    const { data: mentions } = await this.supabase
      .from('brand_mentions')
      .select('id, mentioned_at')
      .eq('event_id', eventId)
      .order('mentioned_at', { ascending: true })
    
    if (mentions && mentions.length > 1) {
      const firstMention = new Date(mentions[0].mentioned_at)
      const lastMention = new Date(mentions[mentions.length - 1].mentioned_at)
      const daysDiff = (lastMention.getTime() - firstMention.getTime()) / (1000 * 60 * 60 * 24)
      ---

## PART 4: SCHEDULED KPI CALCULATION SERVICE
```typescript
// supabase/functions/scheduled-kpi-calculation/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { KPICalculator } from './kpi-calculator.ts'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const calculator = new KPICalculator()

    // Option 1: Process the calculation queue
    console.log('Processing KPI calculation queue...')
    await calculator.processCalculationQueue()

    // Option 2: Calculate for all active events
    const { data: activeEvents } = await supabase
      .from('events')
      .select('id')
      .in('event_status', ['confirmed', 'in_production', 'day_of_show', 'completed'])
      .gte('event_end_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (activeEvents) {
      console.log(`Calculating KPIs for ${activeEvents.length} active events...`)
      
      for (const event of activeEvents) {
        await calculator.calculateAllKPIsForEvent(event.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'KPI calculation completed',
        eventsProcessed: activeEvents?.length || 0
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in scheduled KPI calculation:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## PART 5: DATA FLOW DOCUMENTATION

### Complete Data Flow Map
```markdown
# GVTEWAY Data Flow: Source → KPI

## FINANCIAL KPIs

### Total Event Revenue
**Source Tables**: `transactions`
**Data Points**: 
- transaction_type (ticket_sale, merchandise, food_beverage, parking, sponsorship)
- total_amount
- transaction_status (completed)
**Calculation**: SUM(total_amount) WHERE status = 'completed'
**Triggers**: Transaction INSERT/UPDATE
**Frequency**: Real-time
**Dependencies**: None

### Cost Per Attendee
**Source Tables**: `budget_line_items`, `budgets`, `events`
**Data Points**:
- budget_line_items.actual_amount (expenses)
- events.actual_attendance
**Calculation**: SUM(expenses) / actual_attendance
**Triggers**: Budget line item UPDATE, Event attendance UPDATE
**Frequency**: Daily during event, final after event
**Dependencies**: Total Event Costs, Actual Attendance

### Profit Margin Percentage
**Source Tables**: `transactions`, `budget_line_items`, `budgets`
**Data Points**:
- Total revenue (from transactions)
- Total costs (from budget_line_items)
**Calculation**: ((Revenue - Costs) / Revenue) * 100
**Triggers**: Transaction INSERT/UPDATE, Budget UPDATE
**Frequency**: Daily
**Dependencies**: Total Event Revenue, Total Event Costs

### Revenue Per Available Hour
**Source Tables**: `transactions`, `events`
**Data Points**:
- Total revenue
- Event duration (event_end_date - event_start_date)
**Calculation**: Total Revenue / Duration Hours
**Triggers**: Transaction INSERT/UPDATE
**Frequency**: Daily
**Dependencies**: Total Event Revenue

### Return on Investment
**Source Tables**: `transactions`, `budget_line_items`, `budgets`
**Data Points**:
- Net profit (revenue - costs)
- Total investment (costs)
**Calculation**: (Net Profit / Investment) * 100
**Triggers**: Transaction INSERT/UPDATE, Budget UPDATE
**Frequency**: Daily
**Dependencies**: Total Event Revenue, Total Event Costs

## ATTENDANCE KPIs

### Ticket Sales Conversion Rate
**Source Tables**: `tickets`, `page_views` (analytics)
**Data Points**:
- tickets.ticket_status (sold, not cancelled/refunded)
- Total website visits
**Calculation**: (Tickets Sold / Website Visits) * 100
**Triggers**: Ticket INSERT, Analytics UPDATE
**Frequency**: Hourly during sales period
**Dependencies**: Web analytics integration

### Attendance Rate
**Source Tables**: `check_ins`, `tickets`
**Data Points**:
- check_ins.check_in_status (completed)
- tickets.ticket_status (active, not cancelled/refunded)
**Calculation**: (Checked In / Tickets Sold) * 100
**Triggers**: Check-in INSERT
**Frequency**: Real-time during event
**Dependencies**: None

### Average Ticket Price
**Source Tables**: `tickets`
**Data Points**:
- tickets.final_price
- tickets.ticket_status (sold)
**Calculation**: AVG(final_price)
**Triggers**: Ticket INSERT/UPDATE
**Frequency**: Hourly
**Dependencies**: None

### Sell-Through Rate
**Source Tables**: `tickets`, `events`
**Data Points**:
- tickets.ticket_status (sold)
- events.total_capacity
**Calculation**: (Tickets Sold / Total Capacity) * 100
**Triggers**: Ticket INSERT/UPDATE
**Frequency**: Hourly during sales
**Dependencies**: None

### Early Bird Conversion Rate
**Source Tables**: `tickets`, `ticket_tiers`, `events`
**Data Points**:
- tickets with tier_type = 'early_bird'
- events.total_capacity
**Calculation**: (Early Bird Sales / Total Capacity) * 100
**Triggers**: Ticket INSERT with early_bird tier
**Frequency**: Daily during early bird period
**Dependencies**: None

## OPERATIONAL KPIs

### Staff-to-Attendee Ratio
**Source Tables**: `staff_assignments`, `events`
**Data Points**:
- staff_assignments.assignment_status (not cancelled)
- events.actual_attendance
**Calculation**: COUNT(staff) / actual_attendance
**Triggers**: Staff assignment INSERT/UPDATE, Event attendance UPDATE
**Frequency**: Daily, final after event
**Dependencies**: Actual Attendance

### Setup Time Efficiency
**Source Tables**: `event_logistics`
**Data Points**:
- planned_setup_hours
- actual_setup_hours
**Calculation**: (Planned / Actual) * 100
**Triggers**: Event logistics UPDATE
**Frequency**: Once after load-in
**Dependencies**: None

### Vendor Response Time
**Source Tables**: `vendor_deliverables`
**Data Points**:
- requested_at
- delivered_at
**Calculation**: AVG(delivered_at - requested_at) in hours
**Triggers**: Deliverable UPDATE (delivered)
**Frequency**: Daily
**Dependencies**: None

### Schedule Adherence Rate
**Source Tables**: `project_milestones`
**Data Points**:
- due_date
- completed_at
- is_completed
**Calculation**: (On-time completions / Total completions) * 100
**Triggers**: Milestone UPDATE (completed)
**Frequency**: Daily
**Dependencies**: None

### Task Completion Rate
**Source Tables**: `tasks`
**Data Points**:
- task_status (completed vs. all)
**Calculation**: (Completed / Total) * 100
**Triggers**: Task UPDATE (status change)
**Frequency**: Daily
**Dependencies**: None

## MARKETING KPIs

### Social Media Engagement Rate
**Source Tables**: `social_media_posts`
**Data Points**:
- likes, comments, shares
- impressions
**Calculation**: SUM(interactions) / SUM(impressions) * 100
**Triggers**: Social media post UPDATE (metrics)
**Frequency**: Hourly
**Dependencies**: Social media platform API integration

### Email Campaign Click-Through Rate
**Source Tables**: `email_campaigns`
**Data Points**:
- emails_clicked
- emails_delivered
**Calculation**: SUM(clicks) / SUM(delivered) * 100
**Triggers**: Email campaign UPDATE (metrics)
**Frequency**: Hourly
**Dependencies**: Email service provider integration

### Net Promoter Score
**Source Tables**: `survey_responses`, `surveys`
**Data Points**:
- survey response answers (score field)
- survey_type = 'nps'
**Calculation**: (% Promoters [9-10] - % Detractors [0-6]) * 100
**Triggers**: Survey response INSERT
**Frequency**: Daily
**Dependencies**: Survey system

### Brand Mention Velocity
**Source Tables**: `brand_mentions`
**Data Points**:
- mentioned_at timestamps
**Calculation**: COUNT(mentions) / Days in period
**Triggers**: Brand mention INSERT
**Frequency**: Daily
**Dependencies**: Social listening integration

### Marketing Cost Per Acquisition
**Source Tables**: `marketing_campaigns`, `tickets`
**Data Points**:
- campaigns.actual_spend
- tickets sold (attributed to campaigns)
**Calculation**: Total Marketing Spend / Tickets Sold
**Triggers**: Campaign UPDATE, Ticket INSERT
**Frequency**: Daily
**Dependencies**: Attribution tracking

## CUSTOMER EXPERIENCE KPIs

### Overall Satisfaction Score
**Source Tables**: `survey_responses`, `surveys`
**Data Points**:
- survey answers (rating field)
- survey_type = 'satisfaction'
**Calculation**: AVG(rating)
**Triggers**: Survey response INSERT
**Frequency**: Daily
**Dependencies**: Post-event survey

### Support Ticket Resolution Time
**Source Tables**: `communications` or external ticketing system
**Data Points**:
- created_at
- resolved_at (or read_at as proxy)
**Calculation**: AVG(resolution_time) in hours
**Triggers**: Communication UPDATE (resolved)
**Frequency**: Daily
**Dependencies**: Support system integration

### Refund Request Rate
**Source Tables**: `tickets`
**Data Points**:
- ticket_status (refunded)
- Total tickets
**Calculation**: (Refunded / Total) * 100
**Triggers**: Ticket UPDATE (refunded status)
**Frequency**: Daily
**Dependencies**: None

### First Contact Resolution Rate
**Source Tables**: `communications`
**Data Points**:
- communications with single response
- Total communications requiring response
**Calculation**: (Single-response resolved / Total) * 100
**Triggers**: Communication INSERT/UPDATE
**Frequency**: Daily
**Dependencies**: Communication tracking system

## SAFETY & COMPLIANCE KPIs

### Security Incident Rate
**Source Tables**: `incidents`, `events`
**Data Points**:
- incidents.severity
- events.actual_attendance
**Calculation**: (COUNT(incidents) / actual_attendance) * 100
**Triggers**: Incident INSERT
**Frequency**: Real-time during event, daily after
**Dependencies**: Actual Attendance

### Medical Emergency Response Time
**Source Tables**: `incidents`
**Data Points**:
- medical_response_time_minutes
- medical_attention_required = true
**Calculation**: AVG(response_time_minutes)
**Triggers**: Incident UPDATE (response time recorded)
**Frequency**: Real-time during event
**Dependencies**: None

### Incident-Free Event Percentage
**Source Tables**: `incidents`
**Data Points**:
- COUNT(incidents) per event
**Calculation**: Events with 0 incidents / Total events * 100
**Triggers**: Event completion, incident INSERT
**Frequency**: After event
**Dependencies**: Event completion status

## SUSTAINABILITY KPIs

### Waste Diversion Rate
**Source Tables**: Custom sustainability tracking (to be added)
**Data Points**:
- Weight of recycled/composted materials
- Total waste generated
**Calculation**: (Diverted / Total) * 100
**Triggers**: Manual entry or integration
**Frequency**: After event
**Dependencies**: Waste management tracking

### Carbon Footprint Per Attendee
**Source Tables**: Custom sustainability tracking, `events`
**Data Points**:
- Total CO2 emissions (calculated from energy, transport, etc.)
- events.actual_attendance
**Calculation**: Total CO2 / actual_attendance
**Triggers**: Manual calculation after event
**Frequency**: After event
**Dependencies**: Sustainability data collection

### Local Sourcing Percentage
**Source Tables**: `vendors`, `contracts`, `budget_line_items`
**Data Points**:
- vendor location data
- Contract/purchase amounts by vendor
**Calculation**: (Local vendor spend / Total spend) * 100
**Triggers**: Budget line item INSERT/UPDATE
**Frequency**: Weekly
**Dependencies**: Vendor location classification

## TECHNOLOGY KPIs

### Platform Uptime Percentage
**Source Tables**: External monitoring system
**Data Points**:
- System availability logs
- Downtime incidents
**Calculation**: (Uptime / Total Time) * 100
**Triggers**: Monitoring system API
**Frequency**: Real-time
**Dependencies**: Infrastructure monitoring integration

### Mobile App Download Rate
**Source Tables**: App analytics integration
**Data Points**:
- App downloads
- events.target_attendance or actual_attendance
**Calculation**: (Downloads / Attendees) * 100
**Triggers**: Analytics sync
**Frequency**: Daily
**Dependencies**: App store analytics
```

---

## PART 6: DATA CAPTURE WORKFLOWS

### Event Lifecycle Data Capture Checklist
```markdown
# Data Capture Workflow: Event Lifecycle

## PHASE 1: PLANNING (Event Status: planning)

### Required Data Entry:
- [ ] **Event Creation**
  - Basic info (name, type, dates, venue)
  - Capacity targets
  - Financial targets (revenue, profit margin)
  - → Triggers: Event created, initial KPI targets set

- [ ] **Budget Creation**
  - Revenue projections by category
  - Expense budgets by category
  - → Triggers: Budget baseline established

- [ ] **Team Assignment**
  - Event manager assigned
  - Production coordinator assigned
  - Core team members assigned
  - → Triggers: Resource allocation KPIs initialized

- [ ] **Task Template Application**
  - Project phases created
  - Milestones defined
  - Task list generated
  - → Triggers: Schedule baseline created

### Automated Data Capture:
- Creation timestamps
- User assignments
- Initial KPI targets from event type defaults

### KPIs Initialized:
- Target Revenue
- Target Profit Margin
- Break-Even Attendance
- Budget baseline

## PHASE 2: BUDGETING (Event Status: budgeting)

### Required Data Entry:
- [ ] **Detailed Budget Line Items**
  - All revenue categories estimated
  - All expense categories budgeted
  - Vendor quotes added
  - → Triggers: Detailed financial KPIs calculated

- [ ] **Vendor Selection**
  - Vendors added to event
  - Contracts created
  - Payment terms documented
  - → Triggers: Vendor management KPIs initialized

- [ ] **Contract Management**
  - Contracts uploaded
  - Terms documented
  - Payment schedules set
  - → Triggers: Contract compliance tracking

### Automated Data Capture:
- Budget variance calculations
- Cost allocation by category
- Vendor response times (initial contact)

### KPIs Updated:
- Budgeted costs by category
- Vendor count by category
- Contract values
- Projected profit margin

## PHASE 3: CONFIRMED (Event Status: confirmed)

### Required Data Entry:
- [ ] **Ticket Tiers Created**
  - All tier types defined
  - Pricing set
  - Capacity allocations
  - Sale periods configured
  - → Triggers: Ticket sales KPIs enabled

- [ ] **Marketing Campaigns Launched**
  - Campaign plans created
  - Budgets allocated
  - Content scheduled
  - → Triggers: Marketing KPIs tracking begins

- [ ] **Production Schedule Finalized**
  - Load-in/out times set
  - Detailed timeline created
  - Staff requirements defined
  - → Triggers: Operational timeline tracking

### Automated Data Capture:
- Ticket sale transactions (real-time)
- Email campaign metrics
- Social media metrics
- Website traffic

### KPIs Tracked:
- Daily ticket sales velocity
- Sell-through rate
- Average ticket price
- Marketing campaign performance
- Email open/click rates
- Social media engagement

## PHASE 4: IN PRODUCTION (Event Status: in_production)

### Required Data Entry:
- [ ] **Task Execution**
  - Tasks marked in progress
  - Tasks completed
  - Time entries logged
  - → Triggers: Task completion KPIs

- [ ] **Vendor Deliverables**
  - Deliverable requests created
  - Submissions received
  - Quality checks performed
  - → Triggers: Vendor performance KPIs

- [ ] **Staff Scheduling**
  - Staff assigned to shifts
  - Positions confirmed
  - Special requirements noted
  - → Triggers: Staffing KPIs

- [ ] **Communications Logged**
  - Important communications documented
  - Decisions recorded
  - Issues tracked
  - → Triggers: Communication metrics

### Automated Data Capture:
- Task completion timestamps
- Deliverable submission times
- Staff confirmations
- Budget actual vs. planned

### KPIs Tracked:
- Task completion rate
- Schedule adherence rate
- Vendor response time
- Budget variance
- Staff-to-requirement ratio
- Milestone achievement

## PHASE 5: DAY OF SHOW (Event Status: day_of_show)

### Required Data Entry:
- [ ] **Staff Check-In/Out**
  - Staff arrivals logged
  - Breaks recorded
  - Departures logged
  - → Triggers: Labor hour tracking

- [ ] **Attendee Check-In**
  - Ticket scans (automated)
  - Manual entries (if needed)
  - Issue resolution
  - → Triggers: Attendance KPIs (real-time)

- [ ] **Incident Logging**
  - Any incidents documented
  - Response times recorded
  - Resolutions noted
  - → Triggers: Safety KPIs

- [ ] **Production Schedule Tracking**
  - Schedule items marked complete
  - Actual times recorded
  - Delays documented
  - → Triggers: Operational efficiency KPIs

### Automated Data Capture:
- Check-in timestamps (via scanning)
- Real-time attendance counts
- Door-to-door timing
- Staff time tracking

### KPIs Tracked (Real-Time):
- Current attendance vs. capacity
- Check-in rate
- Average wait time
- Incident rate
- Staff punctuality
- Schedule adherence

## PHASE 6: POST-EVENT (Event Status: completed)

### Required Data Entry:
- [ ] **Final Reconciliation**
  - All transactions finalized
  - Budget actuals updated
  - Outstanding payments noted
  - → Triggers: Final financial KPIs

- [ ] **Staff Hour Finalization**
  - All time entries approved
  - Overtime calculated
  - Final payroll data
  - → Triggers: Final labor cost KPIs

- [ ] **Vendor Invoice Processing**
  - All invoices received
  - Payments processed
  - Final vendor costs recorded
  - → Triggers: Vendor cost KPIs

- [ ] **Post-Event Survey**
  - Survey sent to attendees
  - Responses collected
  - Feedback analyzed
  - → Triggers: Satisfaction KPIs

- [ ] **Final Event Data**
  - Actual attendance confirmed
  - Event end time recorded
  - All materials/equipment returned
  - → Triggers: Final operational KPIs

### Automated Data Capture:
- Survey response collection
- Final transaction settlements
- Automated KPI calculations
- Historical comparison data

### KPIs Finalized:
- Final revenue (all sources)
- Final costs (all categories)
- Actual profit margin
- ROI
- Attendance rate
- NPS score
- Overall satisfaction
- Task completion rate (100% expected)
- Budget variance (final)
- All operational metrics
```

---

## PART 7: INTEGRATION REQUIREMENTS

### Third-Party Integrations Needed
```typescript
// lib/integrations/ticketing-integration.ts

/**
 * Ticketing Platform Integration
 * Captures: Ticket sales, attendee data, check-ins
 * Feeds KPIs: Ticket sales metrics, attendance, revenue
 */
export interface TicketingIntegration {
  // Sync ticket sales to transactions table
  syncTicketSales(): Promise<void>
  
  // Sync check-ins to check_ins table
  syncCheckIns(): Promise<void>
  
  // Get real-time sales data
  getRealTimeSales(eventId: string): Promise<TicketSalesData>
}

// lib/integrations/payment-processor.ts

/**
 * Payment Processor Integration (Stripe, Square, etc.)
 * Captures: Transaction data, refunds, fees
 * Feeds KPIs: Revenue, refund rate, payment method distribution
 */
export interface PaymentProcessorIntegration {
  // Sync all transactions
  syncTransactions(eventId: string): Promise<void>
  
  // Webhook handler for real-time updates
  handleWebhook(payload: any): Promise<void>
  
  // Get settlement data
  getSettlementData(eventId: string): Promise<SettlementData>
}

// lib/integrations/email-marketing.ts

/**
 * Email Marketing Platform Integration (Mailchimp, SendGrid, etc.)
 * Captures: Campaign metrics, subscriber data
 * Feeds KPIs: Email CTR, open rate, list growth
 */
export interface EmailMarketingIntegration {
  // Sync campaign performance
  syncCampaignMetrics(campaignId: string): Promise<void>
  
  // Get real-time metrics
  getCampaignStats(campaignId: string): Promise<CampaignStats>
}

// lib/integrations/social-media.ts

/**
 * Social Media Platform Integrations
 * Captures: Post engagement, follower growth, mentions
 * Feeds KPIs: Social engagement rate, reach, brand mentions
 */
export interface SocialMediaIntegration {
  // Sync post performance
  syncPostMetrics(postId: string): Promise<void>
  
  // Listen for brand mentions
  syncBrandMentions(eventId: string): Promise<void>
  
  // Get audience insights
  getAudienceInsights(): Promise<AudienceData>
}

// lib/integrations/analytics.ts

/**
 * Web Analytics Integration (Google Analytics, etc.)
 * Captures: Website traffic, conversion data
 * Feeds KPIs: Ticket conversion rate, traffic sources
 */
export interface AnalyticsIntegration {
  // Track page views
  trackPageView(url: string, metadata: any): Promise<void>
  
  // Track conversions
  trackConversion(type: string, value: number): Promise<void>
  
  // Get conversion funnel data
  getConversionFunnel(eventId: string): Promise<FunnelData>
}

// lib/integrations/accounting.ts

/**
 * Accounting Software Integration (QuickBooks, Xero, etc.)
 * Captures: Invoices, expenses, payments
 * Feeds KPIs: Financial metrics, vendor payments
 */
export interface AccountingIntegration {
  // Sync expenses
  syncExpenses(eventId: string): Promise<void>
  
  // Sync invoices
  syncInvoices(eventId: string): Promise<void>
  
  // Get P&L statement
  getProfitLoss(eventId: string): Promise<ProfitLossData>
}
```

---

## PART 8: USER INTERFACE FOR DATA ENTRY

### Critical Data Entry Forms
```typescript
// components/events/EventWizard.tsx
// Comprehensive event creation wizard ensuring all KPI data is captured

import { FormWizard } from '@/components/organisms/FormWizard'
import { useState } from 'react'

export function EventCreationWizard() {
  const [eventData, setEventData] = useState({
    // Step 1: Basic Information
    eventName: '',
    eventType: '',
    startDate: null,
    endDate: null,
    venue: null,
    
    // Step 2: Capacity & Targets
    totalCapacity: 0,
    targetAttendance: 0,
    targetRevenue: 0,
    targetProfitMargin: 0,
    
    // Step 3: Team Assignment
    eventManager: null,
    productionCoordinator: null,
    
    // Step 4: Budget Setup
    budgetTemplate: null,
    customBudgetItems: [],
    
    // Step 5: Ticketing Setup
    ticketTiers: [],
    
    // Step 6: Marketing Plan
    marketingCampaigns: [],
    
    // Step 7: Review & Create
  })

  const steps = [
    {
      title: 'Basic Information',
      description: 'Event details and venue',
      component: <BasicInfoStep data={eventData} onChange={setEventData} />,
      validation: validateBasicInfo
    },
    {
      title: 'Capacity & Targets',
      description: 'Set attendance and financial goals',
      component: <TargetsStep data={eventData} onChange={setEventData} />,
      validation: validateTargets
    },
    {
      title: 'Team Assignment',
      description: 'Assign key personnel',
      component: <TeamStep data={eventData} onChange={setEventData} />,
      validation: validateTeam
    },
    {
      title: 'Budget Setup',
      description: 'Create initial budget',
      component: <BudgetStep data={eventData} onChange={setEventData} />,
      validation: validateBudget
    },
    {
      title: 'Ticketing',
      description: 'Configure ticket tiers',
      component: <TicketingStep data={eventData} onChange={setEventData} />,
      validation: validateTicketing
    },
    {
      title: 'Marketing',
      description: 'Plan marketing campaigns',
      component: <MarketingStep data={eventData} onChange={setEventData} />,
      validation: validateMarketing
    },
    {
      title: 'Review',
      description: 'Review and create event',
      component: <ReviewStep data={eventData} />,
      validation: () => true
    }
  ]

  const handleComplete = async () => {
    // Create event with all data
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    })

    if (response.ok) {
      const { eventId } = await response.json()
      
      // Trigger initial KPI calculation
      await fetch('/api/kpis/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId,
          calculateInitial: true 
        })
      })

      // Navigate to event dashboard
      router.push(`/events/${eventId}`)
    }
  }

  return (
    <FormWizard
      steps={steps}
      onComplete={handleComplete}
    />
  )
}
```
```typescript
// components/events/QuickDataEntry.tsx
// Quick entry forms for frequent updates during event execution

export function QuickDataEntryPanel({ eventId }: { eventId: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Quick Expense Entry */}
      <Card>
        <CardHeader>
          <h3>Log Expense</h3>
        </CardHeader>
        <CardBody>
          <QuickExpenseForm eventId={eventId} />
        </CardBody>
      </Card>

      {/* Quick Task Update */}
      <Card>
        <CardHeader>
          <h3>Update Task</h3>
        </CardHeader>
        <CardBody>
          <QuickTaskUpdateForm eventId={eventId} />
        </CardBody>
      </Card>

      {/* Quick Incident Log */}
      <Card>
        <CardHeader>
          <h3>Log Incident</h3>
        </CardHeader>
        <CardBody>
          <QuickIncidentForm eventId={eventId} />
        </CardBody>
      </Card>

      {/* Quick Staff Check-In */}
      <Card>
        <CardHeader>
          <h3>Staff Check-In</h3>
        </CardHeader>
        <CardBody>
          <QuickStaffCheckInForm eventId={eventId} />
        </CardBody>
      </Card>

      {/* Quick Note */}
      <Card>
        <CardHeader>
          <h3>Add Note</h3>
        </CardHeader>
        <CardBody>
          <QuickNoteForm eventId={eventId} />
        </CardBody>
      </Card>

      {/* Quick Communication Log */}
      <Card>
        <CardHeader>
          <h3>Log Communication</h3>
        </CardHeader>
        <CardBody>
          <QuickCommunicationForm eventId={eventId} />
        </CardBody>
      </Card>
    </div>
  )
}
```

---

## CRITICAL SUCCESS FACTORS

✅ **Complete Data Architecture**
- 50+ interconnected tables
- Captures 100% of event production data
- Feeds all 200 KPIs

✅ **Automated KPI Calculation**
- Real-time triggers on data changes
- Scheduled batch calculations
- Queue-based processing for scale

✅ **Data Integrity**
- Foreign key constraints
- Check constraints for valid values
- Triggers for cascading updates
- RLS policies for security

✅ **Integration Ready**
- Clear integration points defined
- Webhook handlers specified
- API endpoints documented

✅ **User-Friendly Data Entry**
- Guided wizards for complex workflows
- Quick entry forms for frequent updates
- Mobile-optimized interfaces
- Auto-save and validation

✅ **Audit Trail**
- Activity logging on all tables
- User attribution
- Timestamp tracking
- Change history

---

## DEPLOYMENT CHECKLIST

- [ ] Deploy all database tables and indexes
- [ ] Create all SQL calculation functions
- [ ] Set up database triggers
- [ ] Configure RLS policies
- [ ] Deploy KPI calculation service
- [ ] Set up scheduled cron jobs
- [ ] Configure integration webhooks
- [ ] Build and deploy data entry UIs
- [ ] Create data migration scripts
- [ ] Set up monitoring and alerting
- [ ] Document API endpoints
- [ ] Train users on data entry workflows

---

**THIS IS YOUR COMPLETE DATA FOUNDATION. BUILD THIS. SHIP THIS. DOMINATE.** 🚀