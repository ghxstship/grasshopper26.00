-- ============================================================================
-- ENTERPRISE RBAC & RLS SYSTEM
-- Comprehensive role-based access control with granular permissions
-- Date: January 2025
-- ============================================================================

-- ============================================================================
-- 1. ROLE ENUMS & TYPE DEFINITIONS
-- ============================================================================

-- Member roles (customer-facing)
CREATE TYPE member_role AS ENUM (
  'member',              -- Subscribed Member (full access)
  'trial_member',        -- Trial Member (read-only, limited features)
  'attendee',            -- Ticketed Single Event Access
  'guest'                -- Invited Guest Single Event Access/Guest List
);

-- Team roles (internal/staff)
CREATE TYPE team_role AS ENUM (
  'legend',              -- Platform Owner (god mode)
  'super_admin',         -- Organization Level Admin
  'admin',               -- Event Level Admin
  'lead',                -- Assignable Department Level
  'team',                -- Assignable Event Level Access Team Member
  'collaborator',        -- Assignable Limited Access Team
  'partner',             -- Read Only Stakeholder
  'ambassador'           -- Brand Ambassador
);

-- Permission scopes
CREATE TYPE permission_scope AS ENUM (
  'global',              -- Platform-wide
  'organization',        -- Organization/brand level
  'event',               -- Event-specific
  'department',          -- Department-specific
  'resource'             -- Individual resource
);

-- Permission actions
CREATE TYPE permission_action AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'manage',              -- Full CRUD
  'publish',
  'approve',
  'assign',
  'transfer',
  'refund',
  'export',
  'import',
  'configure'
);

-- ============================================================================
-- 2. CORE RBAC TABLES
-- ============================================================================

-- Enhanced user profiles with role assignment
ALTER TABLE user_profiles 
  DROP COLUMN IF EXISTS role CASCADE;

ALTER TABLE user_profiles
  ADD COLUMN member_role member_role DEFAULT 'guest',
  ADD COLUMN team_role team_role,
  ADD COLUMN is_team_member boolean DEFAULT false,
  ADD COLUMN department text,
  ADD COLUMN job_title text,
  ADD COLUMN permissions_override jsonb DEFAULT '{}',
  ADD COLUMN access_restrictions jsonb DEFAULT '{}';

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_member_role ON user_profiles(member_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_team_role ON user_profiles(team_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_team ON user_profiles(is_team_member);

-- Resources table (defines all protected resources)
CREATE TABLE IF NOT EXISTS rbac_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_name text UNIQUE NOT NULL,
  resource_type text NOT NULL,
  description text,
  parent_resource_id uuid REFERENCES rbac_resources(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Permissions table (granular permission definitions)
CREATE TABLE IF NOT EXISTS rbac_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name text UNIQUE NOT NULL,
  resource_id uuid REFERENCES rbac_resources(id) ON DELETE CASCADE,
  action permission_action NOT NULL,
  scope permission_scope NOT NULL,
  description text,
  conditions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource_id, action, scope)
);

-- Role permission mappings
CREATE TABLE IF NOT EXISTS rbac_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type text NOT NULL,
  role_name text NOT NULL,
  permission_id uuid REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  granted boolean DEFAULT true,
  conditions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_type, role_name, permission_id)
);

-- User-specific permission overrides
CREATE TABLE IF NOT EXISTS rbac_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  granted boolean NOT NULL,
  scope_context jsonb DEFAULT '{}',
  granted_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission_id, scope_context)
);

-- Event-specific team assignments (moved to 00029_event_team_management.sql for complete implementation)

-- Brand/Organization team assignments
CREATE TABLE IF NOT EXISTS brand_team_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  team_role team_role NOT NULL,
  department text,
  can_manage_brand boolean DEFAULT false,
  can_create_events boolean DEFAULT false,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  removed_at timestamptz,
  UNIQUE(brand_id, user_id)
);

-- Department structure
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  parent_department_id uuid REFERENCES departments(id),
  lead_user_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(brand_id, slug)
);

-- Audit log for permission changes
CREATE TABLE IF NOT EXISTS rbac_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address inet,
  user_agent text,
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rbac_permissions_resource ON rbac_permissions(resource_id);
CREATE INDEX IF NOT EXISTS idx_rbac_permissions_action ON rbac_permissions(action);
CREATE INDEX IF NOT EXISTS idx_rbac_role_perms_role ON rbac_role_permissions(role_type, role_name);
CREATE INDEX IF NOT EXISTS idx_rbac_role_perms_permission ON rbac_role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_rbac_user_perms_user ON rbac_user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_user_perms_permission ON rbac_user_permissions(permission_id);
-- Event team indexes moved to 00029_event_team_management.sql
CREATE INDEX IF NOT EXISTS idx_brand_team_brand ON brand_team_assignments(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_team_user ON brand_team_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_brand ON departments(brand_id);
CREATE INDEX IF NOT EXISTS idx_departments_lead ON departments(lead_user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_user ON rbac_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_resource ON rbac_audit_log(resource_type, resource_id);

-- ============================================================================
-- 4. ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE rbac_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_user_permissions ENABLE ROW LEVEL SECURITY;
-- Event team assignments RLS moved to 00029_event_team_management.sql
ALTER TABLE brand_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_audit_log ENABLE ROW LEVEL SECURITY;
