-- ============================================================================
-- STAFF SCHEDULING & LOGISTICS
-- Part of Super Expansion: Staff management and production logistics
-- ============================================================================

-- Staff Positions table
CREATE TABLE IF NOT EXISTS staff_positions (
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

-- Staff Assignments table
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  checked_in_by UUID REFERENCES auth.users(id),
  checked_out_at TIMESTAMPTZ,
  checked_out_by UUID REFERENCES auth.users(id),
  
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
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production Schedules table
CREATE TABLE IF NOT EXISTS production_schedules (
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
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Logistics table
CREATE TABLE IF NOT EXISTS event_logistics (
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
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins table (for attendee tracking)
CREATE TABLE IF NOT EXISTS check_ins (
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
  checked_in_by UUID REFERENCES auth.users(id),
  
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

-- Indexes
CREATE INDEX idx_staff_positions_org ON staff_positions(organization_id);
CREATE INDEX idx_staff_positions_active ON staff_positions(is_active);

CREATE INDEX idx_staff_assignments_event ON staff_assignments(event_id);
CREATE INDEX idx_staff_assignments_user ON staff_assignments(user_id);
CREATE INDEX idx_staff_assignments_position ON staff_assignments(position_id);
CREATE INDEX idx_staff_assignments_status ON staff_assignments(assignment_status);
CREATE INDEX idx_staff_assignments_schedule ON staff_assignments(scheduled_start, scheduled_end);

CREATE INDEX idx_production_schedules_event ON production_schedules(event_id);
CREATE INDEX idx_production_schedules_date ON production_schedules(schedule_date);
CREATE INDEX idx_production_schedules_type ON production_schedules(schedule_type);
CREATE INDEX idx_production_schedules_status ON production_schedules(schedule_status);

CREATE INDEX idx_event_logistics_event ON event_logistics(event_id);

CREATE INDEX idx_check_ins_event ON check_ins(event_id);
CREATE INDEX idx_check_ins_ticket ON check_ins(ticket_id);
CREATE INDEX idx_check_ins_time ON check_ins(checked_in_at);
CREATE INDEX idx_check_ins_status ON check_ins(check_in_status);

-- RLS Policies
ALTER TABLE staff_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Staff Positions: Users can view positions for their organizations
CREATE POLICY "Users can view staff positions"
  ON staff_positions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Staff Positions: Event managers can manage positions
CREATE POLICY "Event managers can manage staff positions"
  ON staff_positions FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
    )
  );

-- Staff Assignments: Users can view their own assignments
CREATE POLICY "Users can view their own staff assignments"
  ON staff_assignments FOR SELECT
  USING (user_id = auth.uid());

-- Staff Assignments: Event staff can view all assignments for their events
CREATE POLICY "Event staff can view event staff assignments"
  ON staff_assignments FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Staff Assignments: Event managers can manage assignments
CREATE POLICY "Event managers can manage staff assignments"
  ON staff_assignments FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
      )
    )
  );

-- Production Schedules: Users can view schedules for their organization's events
CREATE POLICY "Users can view production schedules"
  ON production_schedules FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Production Schedules: Production coordinators can manage schedules
CREATE POLICY "Production coordinators can manage schedules"
  ON production_schedules FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
      )
    )
  );

-- Event Logistics: Users can view logistics for their organization's events
CREATE POLICY "Users can view event logistics"
  ON event_logistics FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Event Logistics: Production coordinators can manage logistics
CREATE POLICY "Production coordinators can manage logistics"
  ON event_logistics FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
      )
    )
  );

-- Check-ins: Event staff can view and manage check-ins
CREATE POLICY "Event staff can manage check-ins"
  ON check_ins FOR ALL
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

-- Triggers for updated_at
CREATE TRIGGER update_staff_positions_updated_at
  BEFORE UPDATE ON staff_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_assignments_updated_at
  BEFORE UPDATE ON staff_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_schedules_updated_at
  BEFORE UPDATE ON production_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_logistics_updated_at
  BEFORE UPDATE ON event_logistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
