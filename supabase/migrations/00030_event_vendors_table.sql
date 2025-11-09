-- Event Vendors Table
-- Manages vendor invitations, onboarding, and coordination for events

CREATE TABLE IF NOT EXISTS event_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  vendor_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'active', 'completed')),
  
  -- Load-in/Load-out scheduling
  load_in_time TIMESTAMPTZ,
  load_out_time TIMESTAMPTZ,
  special_requirements TEXT,
  
  -- Vendor area and logistics
  assigned_area TEXT,
  parking_pass_number TEXT,
  access_level TEXT DEFAULT 'standard' CHECK (access_level IN ('standard', 'vip', 'restricted')),
  
  -- Documentation
  insurance_verified BOOLEAN DEFAULT FALSE,
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_url TEXT,
  
  -- Tracking
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_vendors_event_id ON event_vendors(event_id);
CREATE INDEX idx_event_vendors_status ON event_vendors(status);
CREATE INDEX idx_event_vendors_vendor_type ON event_vendors(vendor_type);
CREATE INDEX idx_event_vendors_contact_email ON event_vendors(contact_email);
CREATE INDEX idx_event_vendors_load_in_time ON event_vendors(load_in_time) WHERE load_in_time IS NOT NULL;

-- RLS Policies
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;

-- Event organizers and admins can view all vendors for their events
CREATE POLICY "Event organizers can view vendors"
  ON event_vendors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_vendors.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Event organizers can invite vendors
CREATE POLICY "Event organizers can invite vendors"
  ON event_vendors
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_vendors.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Event organizers can update vendor information
CREATE POLICY "Event organizers can update vendors"
  ON event_vendors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_vendors.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Event organizers can delete vendors
CREATE POLICY "Event organizers can delete vendors"
  ON event_vendors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = event_vendors.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Updated at trigger
CREATE TRIGGER update_event_vendors_updated_at
  BEFORE UPDATE ON event_vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE event_vendors IS 'Manages vendor invitations and coordination for events';
COMMENT ON COLUMN event_vendors.status IS 'Vendor status: invited, accepted, declined, active, completed';
COMMENT ON COLUMN event_vendors.vendor_type IS 'Type of vendor service (catering, AV, security, etc.)';
COMMENT ON COLUMN event_vendors.access_level IS 'Vendor access level for the event';
