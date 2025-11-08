-- Waitlist System for Sold-Out Events
-- Allows users to join a waitlist and get notified when tickets become available

CREATE TABLE waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id uuid REFERENCES ticket_types(id) ON DELETE CASCADE,
  position integer NOT NULL,
  quantity_requested integer NOT NULL DEFAULT 1,
  notified boolean DEFAULT false,
  notified_at timestamptz,
  expires_at timestamptz,
  status text DEFAULT 'active', -- active, notified, expired, converted
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id, ticket_type_id)
);

-- Create indexes
CREATE INDEX idx_waitlist_event_id ON waitlist(event_id);
CREATE INDEX idx_waitlist_ticket_type_id ON waitlist(ticket_type_id);
CREATE INDEX idx_waitlist_user_id ON waitlist(user_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_position ON waitlist(position);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own waitlist entries"
  ON waitlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waitlist entries"
  ON waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waitlist entries"
  ON waitlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waitlist entries"
  ON waitlist FOR DELETE
  USING (auth.uid() = user_id);

-- Function to add user to waitlist
CREATE OR REPLACE FUNCTION add_to_waitlist(
  p_user_id uuid,
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity integer DEFAULT 1
)
RETURNS uuid AS $$
DECLARE
  v_position integer;
  v_waitlist_id uuid;
BEGIN
  -- Get the next position in the waitlist
  SELECT COALESCE(MAX(position), 0) + 1
  INTO v_position
  FROM waitlist
  WHERE event_id = p_event_id 
    AND ticket_type_id = p_ticket_type_id
    AND status = 'active';
  
  -- Insert waitlist entry
  INSERT INTO waitlist (
    user_id,
    event_id,
    ticket_type_id,
    position,
    quantity_requested,
    status
  )
  VALUES (
    p_user_id,
    p_event_id,
    p_ticket_type_id,
    v_position,
    p_quantity,
    'active'
  )
  ON CONFLICT (user_id, event_id, ticket_type_id) 
  DO UPDATE SET
    quantity_requested = p_quantity,
    status = 'active',
    updated_at = now()
  RETURNING id INTO v_waitlist_id;
  
  RETURN v_waitlist_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process waitlist when tickets become available
CREATE OR REPLACE FUNCTION process_waitlist(
  p_ticket_type_id uuid,
  p_available_quantity integer
)
RETURNS TABLE (
  waitlist_id uuid,
  user_id uuid,
  email text,
  quantity integer
) AS $$
BEGIN
  RETURN QUERY
  WITH eligible_entries AS (
    SELECT 
      w.id,
      w.user_id,
      w.quantity_requested,
      w.position
    FROM waitlist w
    WHERE w.ticket_type_id = p_ticket_type_id
      AND w.status = 'active'
      AND w.notified = false
    ORDER BY w.position ASC
    LIMIT 10 -- Process top 10 at a time
  ),
  updated_entries AS (
    UPDATE waitlist w
    SET 
      notified = true,
      notified_at = now(),
      status = 'notified',
      expires_at = now() + interval '24 hours',
      updated_at = now()
    FROM eligible_entries e
    WHERE w.id = e.id
    RETURNING w.id, w.user_id, w.quantity_requested
  )
  SELECT 
    u.id as waitlist_id,
    u.user_id,
    au.email,
    u.quantity_requested as quantity
  FROM updated_entries u
  JOIN auth.users au ON au.id = u.user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to remove expired waitlist entries
CREATE OR REPLACE FUNCTION cleanup_expired_waitlist()
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  WITH expired AS (
    UPDATE waitlist
    SET 
      status = 'expired',
      updated_at = now()
    WHERE status = 'notified'
      AND expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM expired;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's waitlist position
CREATE OR REPLACE FUNCTION get_waitlist_position(
  p_user_id uuid,
  p_event_id uuid,
  p_ticket_type_id uuid
)
RETURNS integer AS $$
DECLARE
  v_position integer;
BEGIN
  SELECT position
  INTO v_position
  FROM waitlist
  WHERE user_id = p_user_id
    AND event_id = p_event_id
    AND ticket_type_id = p_ticket_type_id
    AND status = 'active';
  
  RETURN v_position;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT EXECUTE ON FUNCTION add_to_waitlist(uuid, uuid, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION process_waitlist(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_waitlist() TO authenticated;
GRANT EXECUTE ON FUNCTION get_waitlist_position(uuid, uuid, uuid) TO authenticated;
