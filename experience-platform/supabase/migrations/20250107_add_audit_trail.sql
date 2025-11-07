-- Comprehensive audit trail system for tracking all data changes

-- Audit logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL, -- INSERT, UPDATE, DELETE
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brand_admins
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
  changed_fields text[];
BEGIN
  -- Prepare old and new data
  IF TG_OP = 'DELETE' THEN
    old_data = row_to_json(OLD)::jsonb;
    new_data = NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data = NULL;
    new_data = row_to_json(NEW)::jsonb;
  ELSE -- UPDATE
    old_data = row_to_json(OLD)::jsonb;
    new_data = row_to_json(NEW)::jsonb;
    
    -- Identify changed fields
    SELECT array_agg(key)
    INTO changed_fields
    FROM jsonb_each(new_data)
    WHERE new_data->key IS DISTINCT FROM old_data->key;
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_fields,
    user_id,
    user_email
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    auth.uid(),
    auth.email()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_brands
  AFTER INSERT OR UPDATE OR DELETE ON brands
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_events
  AFTER INSERT OR UPDATE OR DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_artists
  AFTER INSERT OR UPDATE OR DELETE ON artists
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_ticket_types
  AFTER INSERT OR UPDATE OR DELETE ON ticket_types
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_tickets
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_product_variants
  AFTER INSERT OR UPDATE OR DELETE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_brand_admins
  AFTER INSERT OR UPDATE OR DELETE ON brand_admins
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_brand_integrations
  AFTER INSERT OR UPDATE OR DELETE ON brand_integrations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Function to query audit history for a specific record
CREATE OR REPLACE FUNCTION get_audit_history(
  p_table_name text,
  p_record_id uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  action text,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  user_email text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.action,
    a.old_values,
    a.new_values,
    a.changed_fields,
    a.user_email,
    a.created_at
  FROM audit_logs a
  WHERE a.table_name = p_table_name
    AND a.record_id = p_record_id
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent changes by user
CREATE OR REPLACE FUNCTION get_user_activity(
  p_user_id uuid,
  p_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  table_name text,
  record_id uuid,
  action text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.table_name,
    a.record_id,
    a.action,
    a.created_at
  FROM audit_logs a
  WHERE a.user_id = p_user_id
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
