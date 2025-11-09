/**
 * Database Performance Optimization
 * Critical indexes for GVTEWAY platform
 */

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

-- Email lookup (login, user search)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Last sign in tracking (active user queries)
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON profiles(last_sign_in_at DESC);

-- Created date (new user reports)
CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(created_at DESC);

-- ============================================================================
-- USER MEMBERSHIPS TABLE
-- ============================================================================

-- User lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);

-- Status filtering (active members)
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);

-- Tier filtering (tier-based queries)
CREATE INDEX IF NOT EXISTS idx_user_memberships_tier ON user_memberships(tier_id);

-- Renewal tracking
CREATE INDEX IF NOT EXISTS idx_user_memberships_renewal ON user_memberships(renewal_date) 
WHERE status = 'active';

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_status ON user_memberships(user_id, status);

-- ============================================================================
-- TICKET CREDITS LEDGER TABLE
-- ============================================================================

-- Membership lookup (balance queries)
CREATE INDEX IF NOT EXISTS idx_credits_membership ON ticket_credits_ledger(membership_id, created_at DESC);

-- Transaction type filtering
CREATE INDEX IF NOT EXISTS idx_credits_type ON ticket_credits_ledger(transaction_type);

-- Expiration tracking
CREATE INDEX IF NOT EXISTS idx_credits_expiration ON ticket_credits_ledger(expires_at) 
WHERE transaction_type = 'allocation' AND expires_at IS NOT NULL;

-- ============================================================================
-- VIP UPGRADE VOUCHERS TABLE
-- ============================================================================

-- Membership lookup
CREATE INDEX IF NOT EXISTS idx_vouchers_membership ON vip_upgrade_vouchers(membership_id);

-- Code lookup (redemption)
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vip_upgrade_vouchers(voucher_code) 
WHERE status = 'active';

-- Status and expiration
CREATE INDEX IF NOT EXISTS idx_vouchers_status_expires ON vip_upgrade_vouchers(status, expires_at);

-- ============================================================================
-- MEMBERSHIP REFERRALS TABLE
-- ============================================================================

-- Referrer lookup
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON membership_referrals(referrer_user_id);

-- Code lookup
CREATE INDEX IF NOT EXISTS idx_referrals_code ON membership_referrals(referral_code) 
WHERE status = 'pending';

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_referrals_status ON membership_referrals(status);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

-- Status filtering (published events)
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date DESC);

-- Composite for common queries
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, start_date DESC);

-- Full-text search on title and description
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING gin(to_tsvector('english', title || ' ' || description));

-- ============================================================================
-- TICKET TYPES TABLE
-- ============================================================================

-- Event lookup
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);

-- Availability check
CREATE INDEX IF NOT EXISTS idx_ticket_types_available ON ticket_types(event_id, available_quantity) 
WHERE available_quantity > 0;

-- ============================================================================
-- TICKETS TABLE
-- ============================================================================

-- User lookup (my tickets)
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id, created_at DESC);

-- Event lookup (event tickets)
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- QR code lookup (scanning)
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code) 
WHERE status IN ('active', 'used');

-- Composite for common queries
CREATE INDEX IF NOT EXISTS idx_tickets_user_status ON tickets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_status ON tickets(event_id, status);

-- ============================================================================
-- TICKET TRANSFERS TABLE
-- ============================================================================

-- Transfer code lookup
CREATE INDEX IF NOT EXISTS idx_transfers_code ON ticket_transfers(transfer_code) 
WHERE status = 'pending';

-- From user lookup
CREATE INDEX IF NOT EXISTS idx_transfers_from_user ON ticket_transfers(from_user_id);

-- To email lookup
CREATE INDEX IF NOT EXISTS idx_transfers_to_email ON ticket_transfers(to_email) 
WHERE status = 'pending';

-- Expiration tracking
CREATE INDEX IF NOT EXISTS idx_transfers_expires ON ticket_transfers(expires_at) 
WHERE status = 'pending';

-- ============================================================================
-- EVENT WAITLIST TABLE
-- ============================================================================

-- Event and ticket type lookup
CREATE INDEX IF NOT EXISTS idx_waitlist_event_ticket ON event_waitlist(event_id, ticket_type_id);

-- Priority ordering
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON event_waitlist(event_id, ticket_type_id, priority_score DESC, created_at ASC) 
WHERE status = 'waiting';

-- User lookup
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON event_waitlist(user_id);

-- Expiration tracking
CREATE INDEX IF NOT EXISTS idx_waitlist_expires ON event_waitlist(expires_at) 
WHERE status = 'notified';

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

-- User lookup (order history)
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Date range queries (analytics)
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Composite for revenue queries
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- ============================================================================
-- ADMIN ACTIONS TABLE
-- ============================================================================

-- Admin lookup
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id, created_at DESC);

-- Target user lookup
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_user_id, created_at DESC);

-- Action type filtering
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at DESC);

-- ============================================================================
-- PERFORMANCE STATISTICS
-- ============================================================================

-- Update table statistics for query planner
ANALYZE profiles;
ANALYZE user_memberships;
ANALYZE ticket_credits_ledger;
ANALYZE vip_upgrade_vouchers;
ANALYZE membership_referrals;
ANALYZE events;
ANALYZE ticket_types;
ANALYZE tickets;
ANALYZE ticket_transfers;
ANALYZE event_waitlist;
ANALYZE orders;
ANALYZE admin_actions;

-- ============================================================================
-- MAINTENANCE QUERIES
-- ============================================================================

-- Check index usage
-- Run periodically to identify unused indexes
/*
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
*/

-- Check table sizes
/*
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/

-- Check slow queries
/*
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
*/
