-- Venue Maps System
-- Interactive venue layouts with stage positions and points of interest

CREATE TABLE venue_maps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  map_type text NOT NULL, -- svg, image, interactive
  map_data jsonb NOT NULL, -- SVG paths, coordinates, layers
  dimensions jsonb, -- {width, height, scale}
  background_image_url text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Map points of interest (stages, facilities, vendors, etc.)
CREATE TABLE venue_map_pois (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_map_id uuid REFERENCES venue_maps(id) ON DELETE CASCADE,
  poi_type text NOT NULL, -- stage, restroom, food, medical, entrance, exit, atm, merchandise
  name text NOT NULL,
  description text,
  coordinates jsonb NOT NULL, -- {x, y} or {lat, lng}
  stage_id uuid REFERENCES event_stages(id),
  icon text, -- icon identifier
  color text, -- hex color for map display
  capacity integer,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_venue_maps_event_id ON venue_maps(event_id);
CREATE INDEX idx_venue_map_pois_venue_map_id ON venue_map_pois(venue_map_id);
CREATE INDEX idx_venue_map_pois_type ON venue_map_pois(poi_type);
CREATE INDEX idx_venue_map_pois_stage_id ON venue_map_pois(stage_id);

-- Enable RLS
ALTER TABLE venue_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_map_pois ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view venue maps"
  ON venue_maps FOR SELECT
  USING (true);

CREATE POLICY "Public can view map POIs"
  ON venue_map_pois FOR SELECT
  USING (true);

-- Admin policies (authenticated users with proper role)
CREATE POLICY "Admins can manage venue maps"
  ON venue_maps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins ba
      JOIN events e ON e.brand_id = ba.brand_id
      WHERE e.id = venue_maps.event_id
        AND ba.user_id = auth.uid()
        AND ba.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Admins can manage map POIs"
  ON venue_map_pois FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins ba
      JOIN events e ON e.brand_id = ba.brand_id
      JOIN venue_maps vm ON vm.event_id = e.id
      WHERE vm.id = venue_map_pois.venue_map_id
        AND ba.user_id = auth.uid()
        AND ba.role IN ('owner', 'admin', 'editor')
    )
  );

-- Function to get venue map with all POIs
CREATE OR REPLACE FUNCTION get_venue_map_with_pois(p_event_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'map', row_to_json(vm.*),
    'pois', COALESCE(
      (
        SELECT jsonb_agg(row_to_json(vmp.*))
        FROM venue_map_pois vmp
        WHERE vmp.venue_map_id = vm.id
      ),
      '[]'::jsonb
    )
  )
  INTO v_result
  FROM venue_maps vm
  WHERE vm.event_id = p_event_id
  LIMIT 1;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to update updated_at
CREATE TRIGGER update_venue_maps_updated_at
  BEFORE UPDATE ON venue_maps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_venue_map_with_pois(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_venue_map_with_pois(uuid) TO anon;
