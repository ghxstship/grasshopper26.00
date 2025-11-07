-- Ticket Inventory Management Functions
-- Atomic operations for managing ticket quantities to prevent overselling

-- Increment tickets sold (used after successful purchase)
CREATE OR REPLACE FUNCTION increment_tickets_sold(
  p_ticket_type_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE ticket_types
  SET 
    quantity_sold = quantity_sold + p_quantity,
    updated_at = now()
  WHERE id = p_ticket_type_id;
  
  -- Raise exception if update didn't affect any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket type not found: %', p_ticket_type_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Decrement tickets sold (used for refunds/cancellations)
CREATE OR REPLACE FUNCTION decrement_tickets_sold(
  p_ticket_type_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE ticket_types
  SET 
    quantity_sold = GREATEST(0, quantity_sold - p_quantity),
    updated_at = now()
  WHERE id = p_ticket_type_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket type not found: %', p_ticket_type_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Check ticket availability (returns available quantity)
CREATE OR REPLACE FUNCTION check_ticket_availability(
  p_ticket_type_id uuid
)
RETURNS integer AS $$
DECLARE
  v_available integer;
BEGIN
  SELECT quantity_available - quantity_sold
  INTO v_available
  FROM ticket_types
  WHERE id = p_ticket_type_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket type not found: %', p_ticket_type_id;
  END IF;
  
  RETURN GREATEST(0, v_available);
END;
$$ LANGUAGE plpgsql STABLE;

-- Reserve tickets (atomic operation to prevent race conditions)
CREATE OR REPLACE FUNCTION reserve_tickets(
  p_ticket_type_id uuid,
  p_quantity integer,
  p_order_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_available integer;
BEGIN
  -- Lock the row for update
  SELECT quantity_available - quantity_sold
  INTO v_available
  FROM ticket_types
  WHERE id = p_ticket_type_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket type not found: %', p_ticket_type_id;
  END IF;
  
  -- Check if enough tickets are available
  IF v_available < p_quantity THEN
    RETURN false;
  END IF;
  
  -- Increment sold quantity
  UPDATE ticket_types
  SET 
    quantity_sold = quantity_sold + p_quantity,
    updated_at = now()
  WHERE id = p_ticket_type_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Update event status based on ticket sales
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS trigger AS $$
DECLARE
  v_event_id uuid;
  v_total_available integer;
  v_total_sold integer;
BEGIN
  -- Get the event_id from the ticket_type
  SELECT event_id INTO v_event_id
  FROM ticket_types
  WHERE id = NEW.id;
  
  -- Calculate total tickets for the event
  SELECT 
    SUM(quantity_available),
    SUM(quantity_sold)
  INTO v_total_available, v_total_sold
  FROM ticket_types
  WHERE event_id = v_event_id;
  
  -- Update event status if sold out
  IF v_total_sold >= v_total_available THEN
    UPDATE events
    SET status = 'sold_out'
    WHERE id = v_event_id AND status = 'on_sale';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update event status
DROP TRIGGER IF EXISTS trigger_update_event_status ON ticket_types;
CREATE TRIGGER trigger_update_event_status
  AFTER UPDATE OF quantity_sold ON ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION update_event_status();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_tickets_sold(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_tickets_sold(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_ticket_availability(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_ticket_availability(uuid) TO anon;
GRANT EXECUTE ON FUNCTION reserve_tickets(uuid, integer, uuid) TO authenticated;
