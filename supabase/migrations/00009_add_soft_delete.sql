-- Add soft delete support with deleted_at timestamp

-- Add deleted_at column to critical tables
ALTER TABLE brands ADD COLUMN deleted_at timestamptz;
ALTER TABLE events ADD COLUMN deleted_at timestamptz;
ALTER TABLE artists ADD COLUMN deleted_at timestamptz;
ALTER TABLE ticket_types ADD COLUMN deleted_at timestamptz;
ALTER TABLE orders ADD COLUMN deleted_at timestamptz;
ALTER TABLE tickets ADD COLUMN deleted_at timestamptz;
ALTER TABLE products ADD COLUMN deleted_at timestamptz;
ALTER TABLE product_variants ADD COLUMN deleted_at timestamptz;
ALTER TABLE content_posts ADD COLUMN deleted_at timestamptz;
ALTER TABLE user_profiles ADD COLUMN deleted_at timestamptz;

-- Create indexes on deleted_at for query performance
CREATE INDEX idx_brands_deleted_at ON brands(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_deleted_at ON events(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_artists_deleted_at ON artists(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_posts_deleted_at ON content_posts(deleted_at) WHERE deleted_at IS NULL;

-- Update RLS policies to exclude soft-deleted records

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published events" ON events;
DROP POLICY IF EXISTS "Public can view artists" ON artists;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Public can view published content" ON content_posts;

-- Recreate policies with soft delete check
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (status IN ('upcoming', 'on_sale', 'sold_out') AND deleted_at IS NULL);

CREATE POLICY "Public can view artists"
  ON artists FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Public can view products"
  ON products FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Public can view published content"
  ON content_posts FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

-- Function to soft delete a record
CREATE OR REPLACE FUNCTION soft_delete(table_name text, record_id uuid)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = NOW() WHERE id = $1', table_name)
  USING record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft-deleted record
CREATE OR REPLACE FUNCTION restore_deleted(table_name text, record_id uuid)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = NULL WHERE id = $1', table_name)
  USING record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete soft-deleted records older than X days
CREATE OR REPLACE FUNCTION purge_deleted_records(table_name text, days_old integer DEFAULT 30)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  EXECUTE format(
    'DELETE FROM %I WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL ''%s days''',
    table_name, days_old
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
