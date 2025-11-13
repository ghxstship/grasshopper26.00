-- Event Issues Table
CREATE TABLE IF NOT EXISTS event_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Event Notes Table
CREATE TABLE IF NOT EXISTS event_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_issues_event_id ON event_issues(event_id);
CREATE INDEX IF NOT EXISTS idx_event_issues_status ON event_issues(status);
CREATE INDEX IF NOT EXISTS idx_event_issues_priority ON event_issues(priority);
CREATE INDEX IF NOT EXISTS idx_event_issues_reported_by ON event_issues(reported_by);
CREATE INDEX IF NOT EXISTS idx_event_issues_created_at ON event_issues(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_notes_event_id ON event_notes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_notes_created_by ON event_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_event_notes_created_at ON event_notes(created_at DESC);

-- RLS Policies for event_issues
ALTER TABLE event_issues ENABLE ROW LEVEL SECURITY;

-- Staff can view issues for events they're assigned to
CREATE POLICY "Staff can view event issues"
  ON event_issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments
      WHERE event_team_assignments.event_id = event_issues.event_id
        AND event_team_assignments.user_id = auth.uid()
        AND event_team_assignments.status IN ('active', 'accepted')
    )
  );

-- Staff can create issues for events they're assigned to
CREATE POLICY "Staff can create event issues"
  ON event_issues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_team_assignments
      WHERE event_team_assignments.event_id = event_issues.event_id
        AND event_team_assignments.user_id = auth.uid()
        AND event_team_assignments.status IN ('active', 'accepted')
    )
  );

-- Staff can update issues they reported
CREATE POLICY "Staff can update their own issues"
  ON event_issues FOR UPDATE
  USING (reported_by = auth.uid());

-- Event leads can update any issue for their events
CREATE POLICY "Event leads can update event issues"
  ON event_issues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments
      WHERE event_team_assignments.event_id = event_issues.event_id
        AND event_team_assignments.user_id = auth.uid()
        AND event_team_assignments.team_role = 'lead'
        AND event_team_assignments.status IN ('active', 'accepted')
    )
  );

-- RLS Policies for event_notes
ALTER TABLE event_notes ENABLE ROW LEVEL SECURITY;

-- Staff can view notes for events they're assigned to
CREATE POLICY "Staff can view event notes"
  ON event_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_team_assignments
      WHERE event_team_assignments.event_id = event_notes.event_id
        AND event_team_assignments.user_id = auth.uid()
        AND event_team_assignments.status IN ('active', 'accepted')
    )
  );

-- Staff can create notes for events they're assigned to
CREATE POLICY "Staff can create event notes"
  ON event_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_team_assignments
      WHERE event_team_assignments.event_id = event_notes.event_id
        AND event_team_assignments.user_id = auth.uid()
        AND event_team_assignments.status IN ('active', 'accepted')
    )
  );

-- Staff can delete their own notes
CREATE POLICY "Staff can delete their own notes"
  ON event_notes FOR DELETE
  USING (created_by = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_issues_updated_at
  BEFORE UPDATE ON event_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_event_issues_updated_at();

-- Comments
COMMENT ON TABLE event_issues IS 'Issues and problems reported by event staff during events';
COMMENT ON TABLE event_notes IS 'Quick notes and updates shared between event staff in real-time';
