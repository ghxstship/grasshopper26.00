-- Add check constraints for business rule validation

-- Events: start_date must be before end_date
ALTER TABLE events
  ADD CONSTRAINT check_event_dates 
  CHECK (end_date IS NULL OR start_date < end_date);

-- Events: capacity must be positive
ALTER TABLE events
  ADD CONSTRAINT check_event_capacity 
  CHECK (capacity IS NULL OR capacity > 0);

-- Ticket types: price must be non-negative
ALTER TABLE ticket_types
  ADD CONSTRAINT check_ticket_price 
  CHECK (price >= 0);

-- Ticket types: quantities must be non-negative
ALTER TABLE ticket_types
  ADD CONSTRAINT check_ticket_quantity_available 
  CHECK (quantity_available IS NULL OR quantity_available >= 0);

ALTER TABLE ticket_types
  ADD CONSTRAINT check_ticket_quantity_sold 
  CHECK (quantity_sold >= 0);

-- Ticket types: quantity_sold cannot exceed quantity_available
ALTER TABLE ticket_types
  ADD CONSTRAINT check_ticket_inventory 
  CHECK (quantity_available IS NULL OR quantity_sold <= quantity_available);

-- Ticket types: sale dates must be valid
ALTER TABLE ticket_types
  ADD CONSTRAINT check_ticket_sale_dates 
  CHECK (sale_start_date IS NULL OR sale_end_date IS NULL OR sale_start_date < sale_end_date);

-- Ticket types: max_per_order must be positive
ALTER TABLE ticket_types
  ADD CONSTRAINT check_ticket_max_per_order 
  CHECK (max_per_order IS NULL OR max_per_order > 0);

-- Orders: total_amount must be non-negative
ALTER TABLE orders
  ADD CONSTRAINT check_order_total 
  CHECK (total_amount >= 0);

-- Products: base_price must be non-negative
ALTER TABLE products
  ADD CONSTRAINT check_product_price 
  CHECK (base_price >= 0);

-- Product variants: price must be non-negative
ALTER TABLE product_variants
  ADD CONSTRAINT check_variant_price 
  CHECK (price IS NULL OR price >= 0);

-- Product variants: stock_quantity must be non-negative
ALTER TABLE product_variants
  ADD CONSTRAINT check_variant_stock 
  CHECK (stock_quantity IS NULL OR stock_quantity >= 0);

-- User profiles: loyalty_points must be non-negative
ALTER TABLE user_profiles
  ADD CONSTRAINT check_loyalty_points 
  CHECK (loyalty_points >= 0);

-- Event schedule: start_time must be before end_time
ALTER TABLE event_schedule
  ADD CONSTRAINT check_schedule_times 
  CHECK (start_time < end_time);

-- Event stages: capacity must be positive
ALTER TABLE event_stages
  ADD CONSTRAINT check_stage_capacity 
  CHECK (capacity IS NULL OR capacity > 0);
