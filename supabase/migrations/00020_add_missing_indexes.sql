-- Migration: Add Missing Indexes for Foreign Keys and Query Optimization
-- Purpose: Improve query performance by adding indexes on frequently queried foreign keys
-- Date: 2025-01-09

-- ============================================================================
-- FOREIGN KEY INDEXES
-- ============================================================================

-- Brand Admins
CREATE INDEX IF NOT EXISTS idx_brand_admins_user_id ON brand_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_admins_brand_id ON brand_admins(brand_id);

-- Event Stages
CREATE INDEX IF NOT EXISTS idx_event_stages_event_id ON event_stages(event_id);

-- Event Schedule
CREATE INDEX IF NOT EXISTS idx_event_schedule_event_id ON event_schedule(event_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_stage_id ON event_schedule(stage_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_artist_id ON event_schedule(artist_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_start_time ON event_schedule(start_time);

-- Event Artists (junction table)
CREATE INDEX IF NOT EXISTS idx_event_artists_artist_id ON event_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_event_artists_event_id ON event_artists(event_id);

-- Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type_id ON tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_tickets_transferred_to_user_id ON tickets(transferred_to_user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Product Variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Content Posts
CREATE INDEX IF NOT EXISTS idx_content_posts_author_id ON content_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_related_event_id ON content_posts(related_event_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_published_at ON content_posts(published_at);

-- Media Gallery
CREATE INDEX IF NOT EXISTS idx_media_gallery_event_id ON media_gallery(event_id);
CREATE INDEX IF NOT EXISTS idx_media_gallery_uploaded_by ON media_gallery(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_gallery_brand_id ON media_gallery(brand_id);

-- User Favorite Artists
CREATE INDEX IF NOT EXISTS idx_user_favorite_artists_artist_id ON user_favorite_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_artists_user_id ON user_favorite_artists(user_id);

-- User Event Schedules
CREATE INDEX IF NOT EXISTS idx_user_event_schedules_user_id ON user_event_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_schedules_event_id ON user_event_schedules(event_id);

-- Brand Integrations
CREATE INDEX IF NOT EXISTS idx_brand_integrations_brand_id ON brand_integrations(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_integrations_status ON brand_integrations(status);

-- ============================================================================
-- INDEXES FOR TABLES FROM OTHER MIGRATIONS
-- ============================================================================

-- User Connections (from 00004_missing_tables.sql)
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

-- User Messages
CREATE INDEX IF NOT EXISTS idx_user_messages_sender_id ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient_id ON user_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_read ON user_messages(read);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);

-- Event Chat Rooms
CREATE INDEX IF NOT EXISTS idx_event_chat_rooms_event_id ON event_chat_rooms(event_id);
CREATE INDEX IF NOT EXISTS idx_event_chat_rooms_stage_id ON event_chat_rooms(stage_id);
CREATE INDEX IF NOT EXISTS idx_event_chat_rooms_active ON event_chat_rooms(active);

-- Event Chat Messages
CREATE INDEX IF NOT EXISTS idx_event_chat_messages_room_id ON event_chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_event_chat_messages_user_id ON event_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_event_chat_messages_created_at ON event_chat_messages(created_at);

-- User Content
CREATE INDEX IF NOT EXISTS idx_user_content_user_id ON user_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_event_id ON user_content(event_id);
CREATE INDEX IF NOT EXISTS idx_user_content_artist_id ON user_content(artist_id);
CREATE INDEX IF NOT EXISTS idx_user_content_content_type ON user_content(content_type);

-- Push Subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Audit Trail (from 00005_add_audit_trail.sql)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Loyalty Program (from 00007_add_loyalty_program.sql)
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);

-- Notifications (from 00008_add_notifications.sql)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Waitlist (from 00012_add_waitlist.sql) - indexes already created in migration
-- CREATE INDEX IF NOT EXISTS idx_waitlist_event_id ON event_waitlist(event_id);
-- CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON event_waitlist(user_id);
-- CREATE INDEX IF NOT EXISTS idx_waitlist_status ON event_waitlist(status);
-- CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON event_waitlist(created_at);

-- Ticket Addons (from 00015_ticket_addons.sql) - indexes already created in migration
-- CREATE INDEX IF NOT EXISTS idx_ticket_addons_event_id ON ticket_addons(event_id);
-- CREATE INDEX IF NOT EXISTS idx_order_addons_order_id ON order_addons(order_id);
-- CREATE INDEX IF NOT EXISTS idx_order_addons_addon_id ON order_addons(addon_id);

-- Venue Maps (from 00016_venue_maps.sql) - indexes already created in migration
-- CREATE INDEX IF NOT EXISTS idx_venue_maps_event_id ON venue_maps(event_id);
-- CREATE INDEX IF NOT EXISTS idx_venue_map_pois_venue_map_id ON venue_map_pois(venue_map_id);

-- Membership System (from 00017_membership_subscription_system.sql)
CREATE INDEX IF NOT EXISTS idx_membership_tiers_is_active ON membership_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_tier_id ON user_memberships(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_user_memberships_renewal_date ON user_memberships(renewal_date);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Events by brand and status (common admin query)
CREATE INDEX IF NOT EXISTS idx_events_brand_status ON events(brand_id, status);

-- Events by date range (common public query)
CREATE INDEX IF NOT EXISTS idx_events_start_end_date ON events(start_date, end_date);

-- Orders by user and status (common user dashboard query)
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Tickets by order and status (common ticket lookup)
CREATE INDEX IF NOT EXISTS idx_tickets_order_status ON tickets(order_id, status);

-- Products by brand and status (common catalog query)
CREATE INDEX IF NOT EXISTS idx_products_brand_status ON products(brand_id, status);

-- Content posts by brand and status (common CMS query)
CREATE INDEX IF NOT EXISTS idx_content_posts_brand_status ON content_posts(brand_id, status);

-- Notifications by user and read status (common notification query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- User memberships by status and renewal date (expiration checks)
CREATE INDEX IF NOT EXISTS idx_user_memberships_status_renewal ON user_memberships(status, renewal_date);

-- ============================================================================
-- GIN INDEXES FOR JSONB AND ARRAY COLUMNS
-- ============================================================================

-- JSONB columns for metadata searches
CREATE INDEX IF NOT EXISTS idx_events_metadata_gin ON events USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_brands_settings_gin ON brands USING gin(settings);

-- Array columns for tag searches
CREATE INDEX IF NOT EXISTS idx_artists_genre_tags_gin ON artists USING gin(genre_tags);
CREATE INDEX IF NOT EXISTS idx_content_posts_tags_gin ON content_posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_media_gallery_tags_gin ON media_gallery USING gin(tags);

-- ============================================================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- ============================================================================

-- Active events only (most common query)
CREATE INDEX IF NOT EXISTS idx_events_active ON events(start_date) 
  WHERE status IN ('upcoming', 'on_sale');

-- Unread notifications only
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, created_at) 
  WHERE read = false;

-- Active memberships only
CREATE INDEX IF NOT EXISTS idx_user_memberships_active ON user_memberships(user_id, renewal_date) 
  WHERE status = 'active';

-- Pending orders only
CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders(created_at) 
  WHERE status = 'pending';

-- ============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

-- Update statistics for query planner optimization
ANALYZE brands;
ANALYZE events;
ANALYZE artists;
ANALYZE orders;
ANALYZE tickets;
ANALYZE products;
ANALYZE user_profiles;
ANALYZE notifications;
ANALYZE user_memberships;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_events_brand_status IS 'Composite index for admin event filtering by brand and status';
COMMENT ON INDEX idx_notifications_user_read IS 'Composite index for user notification queries with read status';
COMMENT ON INDEX idx_events_active IS 'Partial index for active events - most common public query';
COMMENT ON INDEX idx_user_memberships_status_renewal IS 'Composite index for membership expiration checks';
