-- Create enum types for type safety and validation

-- Event status enum
CREATE TYPE event_status AS ENUM (
  'draft',
  'upcoming',
  'on_sale',
  'sold_out',
  'cancelled',
  'past'
);

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'cancelled',
  'refunded'
);

-- Ticket status enum
CREATE TYPE ticket_status AS ENUM (
  'active',
  'used',
  'transferred',
  'cancelled',
  'expired'
);

-- Product status enum
CREATE TYPE product_status AS ENUM (
  'draft',
  'active',
  'archived'
);

-- Content post status enum
CREATE TYPE content_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- Brand admin role enum
CREATE TYPE brand_role AS ENUM (
  'owner',
  'admin',
  'editor',
  'viewer'
);

-- Integration status enum
CREATE TYPE integration_status AS ENUM (
  'active',
  'inactive',
  'error'
);

-- Alter existing tables to use enums (only if columns exist and are TEXT type)
-- These are skipped since tables are created with correct types from the start
-- Uncomment these if you need to migrate existing TEXT columns to ENUMs

/*
ALTER TABLE events 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE event_status USING status::event_status,
  ALTER COLUMN status SET DEFAULT 'upcoming'::event_status;

ALTER TABLE orders 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE order_status USING status::order_status,
  ALTER COLUMN status SET DEFAULT 'pending'::order_status;

ALTER TABLE products 
  ALTER COLUMN status TYPE product_status USING status::product_status,
  ALTER COLUMN status SET DEFAULT 'active'::product_status;

ALTER TABLE content_posts 
  ALTER COLUMN status TYPE content_status USING status::content_status,
  ALTER COLUMN status SET DEFAULT 'draft'::content_status;

ALTER TABLE brand_admins 
  ALTER COLUMN role TYPE brand_role USING role::brand_role;

ALTER TABLE brand_integrations 
  ALTER COLUMN status TYPE integration_status USING status::integration_status,
  ALTER COLUMN status SET DEFAULT 'active'::integration_status;
*/
