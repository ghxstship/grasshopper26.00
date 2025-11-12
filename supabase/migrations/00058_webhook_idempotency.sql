-- Migration: Webhook Idempotency Tracking
-- Description: Add table to track processed webhook events and prevent duplicate processing
-- Author: System
-- Date: 2025-01-15

-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE, -- Stripe event ID or other provider event ID
  event_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe', -- stripe, atlvs, resend, etc.
  payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_status TEXT NOT NULL DEFAULT 'success', -- success, failed, skipped
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on event_id for fast lookups
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);

-- Create index on provider and event_type for analytics
CREATE INDEX idx_webhook_events_provider_type ON webhook_events(provider, event_type);

-- Create index on processed_at for cleanup queries
CREATE INDEX idx_webhook_events_processed_at ON webhook_events(processed_at);

-- Add RLS policies (admin only access)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view webhook events
CREATE POLICY "Platform admins can view webhook events"
  ON webhook_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND is_platform_admin = true
    )
  );

-- No insert/update/delete policies - only server can write via service role

-- Add comment
COMMENT ON TABLE webhook_events IS 'Tracks processed webhook events for idempotency and audit trail';
COMMENT ON COLUMN webhook_events.event_id IS 'Unique event ID from webhook provider (e.g., Stripe event ID)';
COMMENT ON COLUMN webhook_events.processing_status IS 'Status of webhook processing: success, failed, or skipped (duplicate)';
