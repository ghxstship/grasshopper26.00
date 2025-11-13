-- ============================================================================
-- COMMUNICATIONS & NOTES
-- Part of Super Expansion: Communication logging and note-taking
-- ============================================================================

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Communication Details
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'call', 'meeting', 'text', 'in_person', 'other')),
  subject TEXT NOT NULL,
  body TEXT,
  
  -- Participants
  from_user_id UUID REFERENCES auth.users(id),
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
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
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
  related_user_id UUID REFERENCES auth.users(id),
  
  -- Visibility
  is_private BOOLEAN DEFAULT false,
  shared_with_user_ids UUID[],
  
  -- Pinned
  is_pinned BOOLEAN DEFAULT false,
  
  -- Tags
  tags TEXT[],
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communications_event ON communications(event_id);
CREATE INDEX idx_communications_org ON communications(organization_id);
CREATE INDEX idx_communications_from ON communications(from_user_id);
CREATE INDEX idx_communications_type ON communications(communication_type);
CREATE INDEX idx_communications_status ON communications(communication_status);
CREATE INDEX idx_communications_vendor ON communications(related_vendor_id);
CREATE INDEX idx_communications_contract ON communications(related_contract_id);
CREATE INDEX idx_communications_task ON communications(related_task_id);

CREATE INDEX idx_notes_event ON notes(event_id);
CREATE INDEX idx_notes_org ON notes(organization_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_type ON notes(note_type);
CREATE INDEX idx_notes_task ON notes(related_task_id);
CREATE INDEX idx_notes_vendor ON notes(related_vendor_id);
CREATE INDEX idx_notes_pinned ON notes(is_pinned);

-- RLS Policies
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Communications: Users can view communications for their organization
CREATE POLICY "Users can view communications"
  ON communications FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
    OR from_user_id = auth.uid()
    OR auth.uid() = ANY(to_user_ids)
    OR auth.uid() = ANY(cc_user_ids)
  );

-- Communications: Users can create communications
CREATE POLICY "Users can create communications"
  ON communications FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Communications: Creator can update their communications
CREATE POLICY "Users can update their communications"
  ON communications FOR UPDATE
  USING (created_by = auth.uid());

-- Notes: Users can view accessible notes
CREATE POLICY "Users can view notes"
  ON notes FOR SELECT
  USING (
    -- Own notes
    created_by = auth.uid()
    OR
    -- Shared with user
    auth.uid() = ANY(shared_with_user_ids)
    OR
    -- Organization notes (non-private)
    (is_private = false AND organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    ))
  );

-- Notes: Users can create notes
CREATE POLICY "Users can create notes"
  ON notes FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Notes: Creator can update their notes
CREATE POLICY "Users can update their notes"
  ON notes FOR UPDATE
  USING (created_by = auth.uid());

-- Notes: Creator can delete their notes
CREATE POLICY "Users can delete their notes"
  ON notes FOR DELETE
  USING (created_by = auth.uid());

-- Triggers
CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
