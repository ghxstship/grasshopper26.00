-- Add Credential-Based Event Roles
-- Adds AAA, AA, and Production roles for onsite credentialing and responsibilities

-- Drop existing constraint
ALTER TABLE event_team_assignments 
  DROP CONSTRAINT IF EXISTS event_team_assignments_team_role_check;

-- Add new constraint with additional roles
ALTER TABLE event_team_assignments
  ADD CONSTRAINT event_team_assignments_team_role_check 
  CHECK (team_role IN (
    'lead', 'staff', 'vendor', 'talent', 'agent', 
    'sponsor', 'media', 'investor', 'executive',
    'aaa', 'aa', 'production'
  ));

-- Add new role templates for credential-based roles
INSERT INTO event_team_role_templates (name, team_role, position_title, description, access_level, default_permissions) VALUES
  (
    'AAA Credential', 
    'aaa', 
    'AAA Access', 
    'Highest level all-access credential with full backstage, production, and VIP area access. Typically for headliners, tour managers, and key production staff.',
    'full',
    '{
      "backstage": true,
      "production_areas": true,
      "vip_areas": true,
      "stage_access": true,
      "dressing_rooms": true,
      "catering": true,
      "parking": "premium",
      "guest_list": "unlimited",
      "photo_pit": true,
      "soundboard_access": true,
      "green_room": true
    }'::jsonb
  ),
  (
    'AA Credential', 
    'aa', 
    'AA Access', 
    'High-level access credential with backstage and production area access. Typically for supporting artists, management, and essential production crew.',
    'elevated',
    '{
      "backstage": true,
      "production_areas": true,
      "vip_areas": false,
      "stage_access": true,
      "dressing_rooms": "assigned_only",
      "catering": true,
      "parking": "standard",
      "guest_list": "limited",
      "photo_pit": false,
      "soundboard_access": false,
      "green_room": false
    }'::jsonb
  ),
  (
    'Production Crew', 
    'production', 
    'Production Crew', 
    'Production and technical crew credential with access to stage, technical areas, and equipment zones. For audio engineers, lighting techs, stage hands, and technical directors.',
    'elevated',
    '{
      "backstage": true,
      "production_areas": true,
      "vip_areas": false,
      "stage_access": true,
      "dressing_rooms": false,
      "catering": true,
      "parking": "crew",
      "guest_list": "none",
      "photo_pit": false,
      "soundboard_access": true,
      "green_room": false,
      "equipment_zones": true,
      "loading_dock": true,
      "technical_areas": true
    }'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Create credential tracking table
CREATE TABLE IF NOT EXISTS event_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_assignment_id UUID REFERENCES event_team_assignments(id) ON DELETE CASCADE,
  
  -- Credential details
  credential_type TEXT NOT NULL CHECK (credential_type IN ('aaa', 'aa', 'production', 'staff', 'vendor', 'media', 'guest')),
  credential_number TEXT UNIQUE,
  badge_color TEXT, -- e.g., 'red', 'yellow', 'blue', 'green'
  
  -- Holder information
  holder_name TEXT NOT NULL,
  holder_company TEXT,
  holder_role TEXT,
  holder_photo_url TEXT,
  
  -- Access permissions (inherited from role but can be customized)
  access_permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Validity
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Physical credential tracking
  printed BOOLEAN DEFAULT FALSE,
  printed_at TIMESTAMPTZ,
  printed_by UUID REFERENCES auth.users(id),
  
  -- Check-in tracking
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id),
  checked_out BOOLEAN DEFAULT FALSE,
  checked_out_at TIMESTAMPTZ,
  
  -- Security
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  revoke_reason TEXT,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (valid_from < valid_until OR valid_until IS NULL)
);

-- Indexes for credentials
CREATE INDEX idx_credentials_event_id ON event_credentials(event_id);
CREATE INDEX idx_credentials_team_assignment ON event_credentials(team_assignment_id);
CREATE INDEX idx_credentials_type ON event_credentials(credential_type);
CREATE INDEX idx_credentials_number ON event_credentials(credential_number) WHERE credential_number IS NOT NULL;
CREATE INDEX idx_credentials_active ON event_credentials(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_credentials_checked_in ON event_credentials(checked_in) WHERE checked_in = TRUE;

-- RLS for credentials
ALTER TABLE event_credentials ENABLE ROW LEVEL SECURITY;

-- Event leads and security staff can view all credentials
CREATE POLICY "Event leads can view credentials"
  ON event_credentials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_credentials.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role IN ('lead', 'staff', 'production')
      AND eta.status = 'active'
    )
  );

-- Event leads can issue credentials
CREATE POLICY "Event leads can issue credentials"
  ON event_credentials
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_credentials.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Event leads can update credentials
CREATE POLICY "Event leads can update credentials"
  ON event_credentials
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_credentials.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role IN ('lead', 'staff')
      AND eta.status = 'active'
    )
  );

-- Event leads can revoke credentials
CREATE POLICY "Event leads can revoke credentials"
  ON event_credentials
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_credentials.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Updated at trigger
CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON event_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE event_credentials IS 'Manages event credentials and access badges for all team members and guests';
COMMENT ON COLUMN event_credentials.credential_type IS 'Type of credential: aaa, aa, production, staff, vendor, media, guest';
COMMENT ON COLUMN event_credentials.credential_number IS 'Unique credential/badge number for physical identification';
COMMENT ON COLUMN event_credentials.access_permissions IS 'JSON object defining specific access permissions for this credential';
COMMENT ON COLUMN event_credentials.badge_color IS 'Physical badge color for visual identification (red=AAA, yellow=AA, blue=Production, etc.)';
