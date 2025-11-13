-- ============================================================================
-- EQUIPMENT & INVENTORY
-- Part of Super Expansion: Equipment tracking and management
-- ============================================================================

-- Equipment Categories table
CREATE TABLE IF NOT EXISTS equipment_categories (
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

-- Seed Default Equipment Categories
INSERT INTO equipment_categories (organization_id, category_name, category_slug, display_order) VALUES
(NULL, 'Audio Equipment', 'audio-equipment', 1),
(NULL, 'Lighting Equipment', 'lighting-equipment', 2),
(NULL, 'Video Equipment', 'video-equipment', 3),
(NULL, 'Staging Equipment', 'staging-equipment', 4),
(NULL, 'Power Distribution', 'power-distribution', 5),
(NULL, 'Rigging Equipment', 'rigging-equipment', 6),
(NULL, 'Communication Systems', 'communication-systems', 7),
(NULL, 'Computers & IT', 'computers-it', 8),
(NULL, 'Tools', 'tools', 9),
(NULL, 'Safety Equipment', 'safety-equipment', 10)
ON CONFLICT DO NOTHING;

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
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

-- Equipment Assignments table
CREATE TABLE IF NOT EXISTS equipment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Assignment Details
  assigned_to UUID REFERENCES auth.users(id),
  
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
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_equipment_categories_org ON equipment_categories(organization_id);
CREATE INDEX idx_equipment_categories_slug ON equipment_categories(category_slug);

CREATE INDEX idx_equipment_org ON equipment(organization_id);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_slug ON equipment(equipment_slug);
CREATE INDEX idx_equipment_available ON equipment(is_available);
CREATE INDEX idx_equipment_condition ON equipment(condition_status);

CREATE INDEX idx_equipment_assignments_equipment ON equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_event ON equipment_assignments(event_id);
CREATE INDEX idx_equipment_assignments_assigned_to ON equipment_assignments(assigned_to);
CREATE INDEX idx_equipment_assignments_status ON equipment_assignments(assignment_status);

-- RLS Policies
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;

-- Equipment Categories: Users can view categories
CREATE POLICY "Users can view equipment categories"
  ON equipment_categories FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Equipment Categories: Managers can manage categories
CREATE POLICY "Managers can manage equipment categories"
  ON equipment_categories FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
    )
  );

-- Equipment: Users can view organization equipment
CREATE POLICY "Users can view equipment"
  ON equipment FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Equipment: Managers can manage equipment
CREATE POLICY "Managers can manage equipment"
  ON equipment FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
    )
  );

-- Equipment Assignments: Users can view assignments
CREATE POLICY "Users can view equipment assignments"
  ON equipment_assignments FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Equipment Assignments: Staff can manage assignments
CREATE POLICY "Staff can manage equipment assignments"
  ON equipment_assignments FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator', 'staff_member')
      )
    )
  );

-- Triggers
CREATE TRIGGER update_equipment_categories_updated_at
  BEFORE UPDATE ON equipment_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_assignments_updated_at
  BEFORE UPDATE ON equipment_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
