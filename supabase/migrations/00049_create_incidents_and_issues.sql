-- ============================================================================
-- INCIDENTS & ISSUES
-- Part of Super Expansion: Incident tracking and management
-- ============================================================================

-- Incident Types table
CREATE TABLE IF NOT EXISTS incident_types (
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

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
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
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
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

-- Indexes
CREATE INDEX idx_incident_types_org ON incident_types(organization_id);
CREATE INDEX idx_incident_types_slug ON incident_types(type_slug);

CREATE INDEX idx_incidents_event ON incidents(event_id);
CREATE INDEX idx_incidents_type ON incidents(incident_type_id);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(incident_status);
CREATE INDEX idx_incidents_occurred ON incidents(occurred_at);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);

-- RLS Policies
ALTER TABLE incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Incident Types: Users can view types for their organizations
CREATE POLICY "Users can view incident types"
  ON incident_types FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Incident Types: Managers can manage types
CREATE POLICY "Managers can manage incident types"
  ON incident_types FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager')
    )
  );

-- Incidents: Users can view incidents for their organization's events
CREATE POLICY "Users can view incidents"
  ON incidents FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Incidents: Staff can create incidents
CREATE POLICY "Staff can create incidents"
  ON incidents FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Incidents: Assigned users and managers can update
CREATE POLICY "Assigned users can update incidents"
  ON incidents FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
      )
    )
  );

-- Triggers
CREATE TRIGGER update_incident_types_updated_at
  BEFORE UPDATE ON incident_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
