-- Function to increment ticket sold count
CREATE OR REPLACE FUNCTION increment_ticket_sold(ticket_type_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE ticket_types
  SET quantity_sold = COALESCE(quantity_sold, 0) + 1
  WHERE id = ticket_type_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement ticket sold count (for refunds)
CREATE OR REPLACE FUNCTION decrement_ticket_sold(ticket_type_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE ticket_types
  SET quantity_sold = GREATEST(COALESCE(quantity_sold, 0) - 1, 0)
  WHERE id = ticket_type_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check ticket availability
CREATE OR REPLACE FUNCTION check_ticket_availability(ticket_type_id uuid, requested_quantity integer)
RETURNS boolean AS $$
DECLARE
  available integer;
BEGIN
  SELECT (quantity_available - COALESCE(quantity_sold, 0))
  INTO available
  FROM ticket_types
  WHERE id = ticket_type_id;
  
  RETURN available >= requested_quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
