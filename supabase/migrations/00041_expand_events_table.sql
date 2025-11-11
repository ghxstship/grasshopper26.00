-- ============================================================================
-- EXPAND EVENTS TABLE
-- Part of Super Expansion: Add comprehensive event management fields
-- ============================================================================

-- Add new columns to existing events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS event_type_id UUID REFERENCES event_types(id),
  ADD COLUMN IF NOT EXISTS event_code TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS doors_open_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS show_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS show_end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS load_in_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS load_out_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id),
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS total_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS general_admission_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS vip_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS reserved_seating_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS standing_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS target_attendance INTEGER,
  ADD COLUMN IF NOT EXISTS expected_attendance INTEGER,
  ADD COLUMN IF NOT EXISTS actual_attendance INTEGER,
  ADD COLUMN IF NOT EXISTS target_revenue DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS target_profit_margin DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS break_even_attendance INTEGER,
  ADD COLUMN IF NOT EXISTS production_phase TEXT CHECK (production_phase IN ('pre_production', 'production', 'post_production')),
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS event_website_url TEXT,
  ADD COLUMN IF NOT EXISTS ticket_url TEXT,
  ADD COLUMN IF NOT EXISTS promotional_image_url TEXT,
  ADD COLUMN IF NOT EXISTS poster_image_url TEXT,
  ADD COLUMN IF NOT EXISTS client_organization_id UUID REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS client_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS client_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS client_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS event_manager_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS production_coordinator_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update event_status to include new statuses if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'events_event_status_check'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_event_status_check
      CHECK (event_status IN (
        'draft',
        'planning',
        'budgeting',
        'confirmed',
        'in_production',
        'day_of_show',
        'completed',
        'cancelled',
        'postponed'
      ));
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_events_org ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type_id);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_manager ON events(event_manager_id);
CREATE INDEX IF NOT EXISTS idx_events_coordinator ON events(production_coordinator_id);
CREATE INDEX IF NOT EXISTS idx_events_phase ON events(production_phase);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_client_org ON events(client_organization_id);

-- Update RLS policies for expanded events table
DROP POLICY IF EXISTS "Users can view organization events" ON events;
CREATE POLICY "Users can view organization events"
  ON events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
    OR is_public = true
  );

DROP POLICY IF EXISTS "Event managers can manage events" ON events;
CREATE POLICY "Event managers can manage events"
  ON events FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
    )
  );
