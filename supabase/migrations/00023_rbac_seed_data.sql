-- ============================================================================
-- RBAC SEED DATA
-- Part 3 of Enterprise RBAC System - Permissions and Role Mappings
-- ============================================================================

-- ============================================================================
-- 1. SEED DATA - RESOURCES
-- ============================================================================

INSERT INTO rbac_resources (resource_name, resource_type, description) VALUES
  ('events', 'events', 'Event management'),
  ('orders', 'orders', 'Order management'),
  ('tickets', 'tickets', 'Ticket management'),
  ('products', 'products', 'Product management'),
  ('brands', 'brands', 'Brand management'),
  ('users', 'users', 'User management'),
  ('artists', 'artists', 'Artist management'),
  ('content', 'content', 'Content management'),
  ('analytics', 'analytics', 'Analytics and reporting'),
  ('settings', 'settings', 'System settings'),
  ('memberships', 'memberships', 'Membership management'),
  ('refunds', 'refunds', 'Refund processing')
ON CONFLICT (resource_name) DO NOTHING;

-- ============================================================================
-- 2. SEED DATA - PERMISSIONS
-- ============================================================================

-- Insert permissions for each resource and action combination
DO $$
DECLARE
  r RECORD;
  actions permission_action[] := ARRAY['create', 'read', 'update', 'delete', 'manage']::permission_action[];
  act permission_action;
BEGIN
  FOR r IN SELECT id, resource_name FROM rbac_resources LOOP
    FOREACH act IN ARRAY actions LOOP
      INSERT INTO rbac_permissions (permission_name, resource_id, action, scope, description)
      VALUES (
        r.resource_name || '.' || act::text,
        r.id,
        act,
        'global',
        'Permission to ' || act::text || ' ' || r.resource_name
      )
      ON CONFLICT (resource_id, action, scope) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- 3. SEED DATA - TEAM ROLE PERMISSIONS
-- ============================================================================

-- LEGEND: All permissions (god mode)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'legend', id, true
FROM rbac_permissions
ON CONFLICT DO NOTHING;

-- SUPER_ADMIN: All permissions except legend-specific
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'super_admin', id, true
FROM rbac_permissions
ON CONFLICT DO NOTHING;

-- ADMIN: Event and resource management (no delete on critical resources)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'admin', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'orders', 'tickets', 'products', 'artists', 'content')
  AND (p.action IN ('create', 'read', 'update', 'manage') OR 
       (p.action = 'delete' AND r.resource_name NOT IN ('orders', 'users')))
ON CONFLICT DO NOTHING;

-- LEAD: Department-level management (read and update)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'lead', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'orders', 'tickets', 'artists', 'content')
  AND p.action IN ('read', 'update')
ON CONFLICT DO NOTHING;

-- TEAM: Event-level access (read and limited update)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'team', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'orders', 'tickets')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- COLLABORATOR: Limited access (read-only on assigned resources)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'collaborator', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'artists', 'content')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- PARTNER: Read-only stakeholder (analytics and events)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'partner', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE p.action = 'read'
  AND r.resource_name IN ('events', 'analytics', 'orders')
ON CONFLICT DO NOTHING;

-- AMBASSADOR: Brand representation (read events, artists, content)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'ambassador', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'artists', 'content')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. SEED DATA - MEMBER ROLE PERMISSIONS
-- ============================================================================

-- MEMBER: Full member access (read all, manage own data)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'member', 'member', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'tickets', 'orders', 'artists', 'products', 'memberships')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- TRIAL_MEMBER: Read-only access (limited features)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'member', 'trial_member', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'artists')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- ATTENDEE: Event-specific access (own tickets and event details)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'member', 'attendee', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'tickets', 'orders')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- GUEST: Minimal access (invited guest list access)
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'member', 'guest', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name IN ('events', 'artists')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. ADDITIONAL SPECIFIC PERMISSIONS
-- ============================================================================

-- Add refund permission to admin and super_admin
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'admin', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name = 'refunds'
  AND p.action IN ('read', 'create')
ON CONFLICT DO NOTHING;

INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'super_admin', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name = 'refunds'
ON CONFLICT DO NOTHING;

-- Add settings management to super_admin only
INSERT INTO rbac_role_permissions (role_type, role_name, permission_id, granted)
SELECT 'team', 'super_admin', p.id, true
FROM rbac_permissions p
JOIN rbac_resources r ON p.resource_id = r.id
WHERE r.resource_name = 'settings'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE rbac_resources IS 'Defines all protected resources in the system';
COMMENT ON TABLE rbac_permissions IS 'Granular permissions for resource actions';
COMMENT ON TABLE rbac_role_permissions IS 'Maps permissions to member and team roles';
COMMENT ON TABLE rbac_user_permissions IS 'User-specific permission overrides';
-- Event team assignments comment moved to 00029_event_team_management.sql
COMMENT ON TABLE brand_team_assignments IS 'Brand/organization team member assignments';
COMMENT ON TABLE departments IS 'Organizational department structure';
COMMENT ON TABLE rbac_audit_log IS 'Audit trail for all permission and role changes';

COMMENT ON TYPE member_role IS 'Customer-facing member roles: member, trial_member, attendee, guest';
COMMENT ON TYPE team_role IS 'Internal team roles: legend, super_admin, admin, lead, team, collaborator, partner, ambassador';
COMMENT ON TYPE permission_scope IS 'Scope of permission: global, organization, event, department, resource';
COMMENT ON TYPE permission_action IS 'Action type: create, read, update, delete, manage, publish, approve, assign, transfer, refund, export, import, configure';
