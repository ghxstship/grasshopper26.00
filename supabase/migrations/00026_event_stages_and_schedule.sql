-- Event Stages and Schedule Tables
-- Supports multi-stage events with performance scheduling

-- Event Stages Table
CREATE TABLE IF NOT EXISTS event_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, name)
);

-- Event Schedule Table
CREATE TABLE IF NOT EXISTS event_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES event_stages(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_stages_event_id ON event_stages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_event_id ON event_schedule(event_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_stage_id ON event_schedule(stage_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_artist_id ON event_schedule(artist_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_start_time ON event_schedule(start_time);

-- RLS Policies
ALTER TABLE event_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_schedule ENABLE ROW LEVEL SECURITY;

-- Public can view stages and schedule for published events
CREATE POLICY "Public can view stages for published events"
  ON event_stages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_stages.event_id
      AND events.status IN ('published', 'on_sale', 'upcoming')
    )
  );

CREATE POLICY "Public can view schedule for published events"
  ON event_schedule FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_schedule.event_id
      AND events.status IN ('published', 'on_sale', 'upcoming')
    )
  );

-- Admins can manage stages
CREATE POLICY "Admins can manage stages"
  ON event_stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins
      WHERE brand_admins.user_id = auth.uid()
    )
  );

-- Admins can manage schedule
CREATE POLICY "Admins can manage schedule"
  ON event_schedule FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins
      WHERE brand_admins.user_id = auth.uid()
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_event_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_stages_updated_at
  BEFORE UPDATE ON event_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_event_stages_updated_at();

CREATE OR REPLACE FUNCTION update_event_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_schedule_updated_at
  BEFORE UPDATE ON event_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_event_schedule_updated_at();

-- Comments
COMMENT ON TABLE event_stages IS 'Stages/venues within multi-stage events';
COMMENT ON TABLE event_schedule IS 'Performance schedule mapping artists to stages and times';
COMMENT ON COLUMN event_stages.capacity IS 'Maximum capacity for this specific stage';
COMMENT ON COLUMN event_schedule.start_time IS 'Performance start time';
COMMENT ON COLUMN event_schedule.end_time IS 'Performance end time';
