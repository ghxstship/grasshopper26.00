-- ============================================================================
-- EVENT TYPES & VENUES
-- Part of Super Expansion: Full event production platform
-- ============================================================================

-- Event Types table
CREATE TABLE IF NOT EXISTS event_types (
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
  typical_budget_range JSONB,
  
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

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
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
  stage_dimensions JSONB,
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

-- Indexes
CREATE INDEX idx_event_types_org ON event_types(organization_id);
CREATE INDEX idx_event_types_slug ON event_types(type_slug);
CREATE INDEX idx_event_types_active ON event_types(is_active);

CREATE INDEX idx_venues_org ON venues(organization_id);
CREATE INDEX idx_venues_slug ON venues(venue_slug);
CREATE INDEX idx_venues_location ON venues(city, state);
CREATE INDEX idx_venues_capacity ON venues(max_capacity);
CREATE INDEX idx_venues_type ON venues(venue_type);
CREATE INDEX idx_venues_active ON venues(is_active);

-- RLS Policies
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Event Types: Users can view event types for their organizations
CREATE POLICY "Users can view organization event types"
  ON event_types FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Event Types: Event managers and above can manage event types
CREATE POLICY "Event managers can manage event types"
  ON event_types FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager')
    )
  );

-- Venues: Users can view venues for their organizations
CREATE POLICY "Users can view organization venues"
  ON venues FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Venues: Event managers and above can manage venues
CREATE POLICY "Event managers can manage venues"
  ON venues FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
