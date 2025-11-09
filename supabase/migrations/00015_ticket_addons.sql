-- Ticket Add-ons System
-- Parking, lockers, camping, merchandise, and other event add-ons

CREATE TABLE ticket_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  addon_type text NOT NULL, -- parking, locker, camping, merchandise, vip_upgrade, shuttle
  price decimal(10,2) NOT NULL,
  quantity_available integer,
  quantity_sold integer DEFAULT 0,
  max_per_order integer DEFAULT 10,
  requires_ticket boolean DEFAULT true, -- Must purchase with ticket
  available_for_ticket_types uuid[], -- Specific ticket types this addon is available for
  stripe_price_id text,
  image_url text,
  metadata jsonb,
  status text DEFAULT 'active', -- active, inactive, sold_out
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order add-ons junction table
CREATE TABLE order_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES ticket_addons(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_ticket_addons_event_id ON ticket_addons(event_id);
CREATE INDEX idx_ticket_addons_addon_type ON ticket_addons(addon_type);
CREATE INDEX idx_ticket_addons_status ON ticket_addons(status);
CREATE INDEX idx_order_addons_order_id ON order_addons(order_id);
CREATE INDEX idx_order_addons_addon_id ON order_addons(addon_id);

-- Enable RLS
ALTER TABLE ticket_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ticket_addons
CREATE POLICY "Public can view active addons"
  ON ticket_addons FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can view all addons"
  ON ticket_addons FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for order_addons
CREATE POLICY "Users can view their own order addons"
  ON order_addons FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order addons"
  ON order_addons FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Function to check addon availability
CREATE OR REPLACE FUNCTION check_addon_availability(
  p_addon_id uuid,
  p_quantity integer
)
RETURNS boolean AS $$
DECLARE
  v_available integer;
BEGIN
  SELECT quantity_available - quantity_sold
  INTO v_available
  FROM ticket_addons
  WHERE id = p_addon_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Addon not found: %', p_addon_id;
  END IF;
  
  -- If quantity_available is NULL, unlimited availability
  IF v_available IS NULL THEN
    RETURN true;
  END IF;
  
  RETURN v_available >= p_quantity;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to reserve addons
CREATE OR REPLACE FUNCTION reserve_addons(
  p_addon_id uuid,
  p_quantity integer
)
RETURNS boolean AS $$
DECLARE
  v_available integer;
BEGIN
  -- Lock the row for update
  SELECT quantity_available - quantity_sold
  INTO v_available
  FROM ticket_addons
  WHERE id = p_addon_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Addon not found: %', p_addon_id;
  END IF;
  
  -- If quantity_available is NULL, unlimited availability
  IF v_available IS NULL THEN
    UPDATE ticket_addons
    SET 
      quantity_sold = quantity_sold + p_quantity,
      updated_at = now()
    WHERE id = p_addon_id;
    RETURN true;
  END IF;
  
  -- Check if enough addons are available
  IF v_available < p_quantity THEN
    RETURN false;
  END IF;
  
  -- Increment sold quantity
  UPDATE ticket_addons
  SET 
    quantity_sold = quantity_sold + p_quantity,
    updated_at = now()
  WHERE id = p_addon_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to increment addon sales
CREATE OR REPLACE FUNCTION increment_addons_sold(
  p_addon_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE ticket_addons
  SET 
    quantity_sold = quantity_sold + p_quantity,
    updated_at = now()
  WHERE id = p_addon_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Addon not found: %', p_addon_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement addon sales (for refunds)
CREATE OR REPLACE FUNCTION decrement_addons_sold(
  p_addon_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE ticket_addons
  SET 
    quantity_sold = GREATEST(0, quantity_sold - p_quantity),
    updated_at = now()
  WHERE id = p_addon_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Addon not found: %', p_addon_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update addon status based on inventory
CREATE OR REPLACE FUNCTION update_addon_status()
RETURNS trigger AS $$
BEGIN
  -- Update status to sold_out if inventory is depleted
  IF NEW.quantity_available IS NOT NULL 
     AND NEW.quantity_sold >= NEW.quantity_available THEN
    NEW.status = 'sold_out';
  ELSIF NEW.status = 'sold_out' 
        AND NEW.quantity_sold < NEW.quantity_available THEN
    NEW.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for addon status updates
CREATE TRIGGER trigger_update_addon_status
  BEFORE UPDATE OF quantity_sold ON ticket_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_addon_status();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_ticket_addons_updated_at
  BEFORE UPDATE ON ticket_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_addon_availability(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_addon_availability(uuid, integer) TO anon;
GRANT EXECUTE ON FUNCTION reserve_addons(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_addons_sold(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_addons_sold(uuid, integer) TO authenticated;
