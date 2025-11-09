-- Event Team Management Tables
-- Manages team assignments, roles, and coordination for events

-- Event Team Assignments Table
CREATE TABLE IF NOT EXISTS event_team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Team member details (for external/non-registered users)
  external_name TEXT,
  external_email TEXT,
  external_phone TEXT,
  
  -- Role and permissions
  team_role TEXT NOT NULL CHECK (team_role IN (
    'lead', 'staff', 'vendor', 'talent', 'agent', 
    'sponsor', 'media', 'investor', 'stakeholder'
  )),
  position_title TEXT, -- e.g., "Stage Manager", "Security Lead", "Photographer"
  
  -- Access control
  access_start_date TIMESTAMPTZ,
  access_end_date TIMESTAMPTZ,
  access_level TEXT DEFAULT 'standard' CHECK (access_level IN ('standard', 'elevated', 'full')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN (
    'invited', 'accepted', 'declined', 'active', 'completed', 'removed'
  )),
  
  -- Invitation tracking
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invitation_sent BOOLEAN DEFAULT FALSE,
  invitation_token TEXT UNIQUE,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  -- Contact preferences
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": false,
    "push": true
  }'::jsonb,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_user_or_external CHECK (
    user_id IS NOT NULL OR (external_name IS NOT NULL AND external_email IS NOT NULL)
  ),
  CONSTRAINT valid_access_dates CHECK (
    access_start_date IS NULL OR access_end_date IS NULL OR access_start_date < access_end_date
  )
);

-- Event Team Roles Template Table
-- Predefined role templates for quick assignment
CREATE TABLE IF NOT EXISTS event_team_role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_role TEXT NOT NULL,
  position_title TEXT NOT NULL,
  description TEXT,
  access_level TEXT DEFAULT 'standard',
  default_permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default role templates
INSERT INTO event_team_role_templates (name, team_role, position_title, description, access_level) VALUES
  ('Event Lead', 'lead', 'Event Lead', 'Primary event coordinator with full access', 'full'),
  ('Stage Manager', 'staff', 'Stage Manager', 'Manages stage operations and artist coordination', 'elevated'),
  ('Security Lead', 'staff', 'Security Lead', 'Oversees event security operations', 'elevated'),
  ('Check-In Staff', 'staff', 'Check-In Staff', 'Handles ticket scanning and attendee check-in', 'standard'),
  ('Photographer', 'media', 'Photographer', 'Event photography coverage', 'standard'),
  ('Videographer', 'media', 'Videographer', 'Event video coverage', 'standard'),
  ('Catering Vendor', 'vendor', 'Catering Vendor', 'Food and beverage services', 'standard'),
  ('AV Technician', 'vendor', 'AV Technician', 'Audio/visual equipment and support', 'elevated'),
  ('Performing Artist', 'talent', 'Performing Artist', 'Event performer', 'standard'),
  ('Artist Manager', 'agent', 'Artist Manager', 'Represents and coordinates for talent', 'standard'),
  ('Title Sponsor', 'sponsor', 'Title Sponsor', 'Primary event sponsor', 'elevated'),
  ('Press/Media', 'media', 'Press/Media', 'Media coverage and press', 'standard'),
  ('Investor', 'investor', 'Investor', 'Event investor with financial interest', 'elevated'),
  ('Stakeholder', 'stakeholder', 'Stakeholder', 'Event stakeholder', 'standard')
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX idx_team_assignments_event_id ON event_team_assignments(event_id);
CREATE INDEX idx_team_assignments_user_id ON event_team_assignments(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_team_assignments_team_role ON event_team_assignments(team_role);
CREATE INDEX idx_team_assignments_status ON event_team_assignments(status);
CREATE INDEX idx_team_assignments_external_email ON event_team_assignments(external_email) WHERE external_email IS NOT NULL;
CREATE INDEX idx_team_assignments_invitation_token ON event_team_assignments(invitation_token) WHERE invitation_token IS NOT NULL;

-- RLS Policies
ALTER TABLE event_team_assignments ENABLE ROW LEVEL SECURITY;

-- Event leads and admins can view all team members
CREATE POLICY "Event leads can view team"
  ON event_team_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_team_assignments.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
    OR user_id = auth.uid() -- Users can see their own assignments
  );

-- Event leads can invite team members
CREATE POLICY "Event leads can invite team"
  ON event_team_assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_team_assignments.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Event leads can update team assignments
CREATE POLICY "Event leads can update team"
  ON event_team_assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_team_assignments.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
    OR (user_id = auth.uid() AND status = 'invited') -- Users can accept/decline their own invitations
  );

-- Event leads can remove team members
CREATE POLICY "Event leads can remove team"
  ON event_team_assignments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_team_assignments.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Role templates are public
ALTER TABLE event_team_role_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role templates are viewable by authenticated users"
  ON event_team_role_templates
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Updated at triggers
CREATE TRIGGER update_team_assignments_updated_at
  BEFORE UPDATE ON event_team_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_templates_updated_at
  BEFORE UPDATE ON event_team_role_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE event_team_assignments IS 'Manages team member assignments and roles for events';
COMMENT ON TABLE event_team_role_templates IS 'Predefined role templates for quick team assignment';
COMMENT ON COLUMN event_team_assignments.team_role IS 'High-level role category (lead, staff, vendor, talent, etc.)';
COMMENT ON COLUMN event_team_assignments.position_title IS 'Specific position title (Stage Manager, Photographer, etc.)';
COMMENT ON COLUMN event_team_assignments.access_level IS 'Access level for event resources and data';
