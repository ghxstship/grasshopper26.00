-- Waitlist system for sold-out events

-- Waitlist status enum
CREATE TYPE waitlist_status AS ENUM (
  'active',
  'notified',
  'converted',
  'expired',
  'cancelled'
);

-- Event waitlist table
CREATE TABLE event_waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id uuid REFERENCES ticket_types(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  quantity_requested integer NOT NULL DEFAULT 1,
  status waitlist_status DEFAULT 'active',
  notified_at timestamptz,
  expires_at timestamptz,
  converted_order_id uuid REFERENCES orders(id),
  metadata jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  -- Prevent duplicate active waitlist entries
  UNIQUE(event_id, ticket_type_id, user_id, status)
);

-- Indexes for waitlist
CREATE INDEX idx_waitlist_event_id ON event_waitlist(event_id);
CREATE INDEX idx_waitlist_user_id ON event_waitlist(user_id);
CREATE INDEX idx_waitlist_status ON event_waitlist(status);
CREATE INDEX idx_waitlist_created_at ON event_waitlist(created_at);
CREATE INDEX idx_waitlist_expires_at ON event_waitlist(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own waitlist entries"
  ON event_waitlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own waitlist entries"
  ON event_waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waitlist entries"
  ON event_waitlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all waitlist entries"
  ON event_waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Function to join waitlist
CREATE OR REPLACE FUNCTION join_waitlist(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity integer DEFAULT 1
)
RETURNS uuid AS $$
DECLARE
  waitlist_id uuid;
  user_email text;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if user is already on waitlist
  IF EXISTS (
    SELECT 1 FROM event_waitlist
    WHERE event_id = p_event_id
      AND ticket_type_id = p_ticket_type_id
      AND user_id = auth.uid()
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Already on waitlist for this ticket type';
  END IF;
  
  -- Create waitlist entry
  INSERT INTO event_waitlist (
    event_id,
    ticket_type_id,
    user_id,
    email,
    quantity_requested
  ) VALUES (
    p_event_id,
    p_ticket_type_id,
    auth.uid(),
    user_email,
    p_quantity
  )
  RETURNING id INTO waitlist_id;
  
  RETURN waitlist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify waitlist users when tickets become available
CREATE OR REPLACE FUNCTION notify_waitlist(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_available_quantity integer
)
RETURNS integer AS $$
DECLARE
  notified_count integer := 0;
  waitlist_entry RECORD;
BEGIN
  -- Get waitlist entries in order of creation
  FOR waitlist_entry IN
    SELECT id, user_id, quantity_requested
    FROM event_waitlist
    WHERE event_id = p_event_id
      AND (p_ticket_type_id IS NULL OR ticket_type_id = p_ticket_type_id)
      AND status = 'active'
    ORDER BY created_at ASC
  LOOP
    EXIT WHEN notified_count >= p_available_quantity;
    
    -- Update waitlist entry
    UPDATE event_waitlist
    SET 
      status = 'notified',
      notified_at = NOW(),
      expires_at = NOW() + INTERVAL '24 hours'
    WHERE id = waitlist_entry.id;
    
    -- Create notification
    PERFORM create_notification(
      waitlist_entry.user_id,
      'waitlist_available'::notification_type,
      'email'::notification_channel,
      'Tickets Available!',
      'Tickets are now available for an event on your waitlist. You have 24 hours to complete your purchase.',
      '/events/' || p_event_id::text,
      'View Event',
      jsonb_build_object('event_id', p_event_id, 'ticket_type_id', p_ticket_type_id)
    );
    
    notified_count := notified_count + 1;
  END LOOP;
  
  RETURN notified_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old waitlist notifications
CREATE OR REPLACE FUNCTION expire_waitlist_notifications()
RETURNS integer AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE event_waitlist
  SET status = 'expired'
  WHERE status = 'notified'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark waitlist as converted when order is placed
CREATE OR REPLACE FUNCTION convert_waitlist_entry(
  p_waitlist_id uuid,
  p_order_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE event_waitlist
  SET 
    status = 'converted',
    converted_order_id = p_order_id,
    updated_at = NOW()
  WHERE id = p_waitlist_id
    AND user_id = auth.uid()
    AND status = 'notified';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel waitlist entry
CREATE OR REPLACE FUNCTION cancel_waitlist_entry(p_waitlist_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE event_waitlist
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_waitlist_id
    AND user_id = auth.uid()
    AND status IN ('active', 'notified');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get waitlist position
CREATE OR REPLACE FUNCTION get_waitlist_position(p_waitlist_id uuid)
RETURNS integer AS $$
DECLARE
  position integer;
  entry_event_id uuid;
  entry_ticket_type_id uuid;
  entry_created_at timestamptz;
BEGIN
  -- Get waitlist entry details
  SELECT event_id, ticket_type_id, created_at
  INTO entry_event_id, entry_ticket_type_id, entry_created_at
  FROM event_waitlist
  WHERE id = p_waitlist_id;
  
  -- Calculate position
  SELECT COUNT(*) + 1
  INTO position
  FROM event_waitlist
  WHERE event_id = entry_event_id
    AND ticket_type_id = entry_ticket_type_id
    AND status = 'active'
    AND created_at < entry_created_at;
  
  RETURN position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE TRIGGER update_event_waitlist_updated_at
  BEFORE UPDATE ON event_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically notify waitlist when tickets are refunded
CREATE OR REPLACE FUNCTION auto_notify_waitlist_on_refund()
RETURNS TRIGGER AS $$
BEGIN
  -- If order status changed to refunded, notify waitlist
  IF OLD.status != 'refunded' AND NEW.status = 'refunded' THEN
    -- Get ticket quantities from order_items
    PERFORM notify_waitlist(
      NEW.event_id,
      NULL, -- Notify for all ticket types
      1 -- Notify one person per refunded ticket
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_waitlist_on_order_refund
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'refunded')
  EXECUTE FUNCTION auto_notify_waitlist_on_refund();
