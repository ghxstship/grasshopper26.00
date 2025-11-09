-- ============================================================================
-- EVENT-SPECIFIC ROLES SYSTEM
-- Contextual role assignments for event-scoped access control
-- Date: January 2025
-- ============================================================================

-- ============================================================================
-- 1. EVENT ROLE TYPE ENUM
-- ============================================================================

-- Event-specific role types
CREATE TYPE event_role_type AS ENUM (
  'event_lead',      -- Event Lead (elevated permissions)
  'event_staff',     -- Event Staff (on-site operations)
  'vendor',          -- Vendor (limited content access)
  'talent',          -- Talent/Artist (performer access)
  'agent',           -- Agent (talent representative)
  'sponsor',         -- Sponsor (analytics access)
  'media',           -- Media/Press (content access)
  'investor',        -- Investor (financial reporting)
  'stakeholder'      -- Stakeholder (read-only)
);

-- Access level types
CREATE TYPE event_access_level AS ENUM (
  'standard',        -- Standard access per role definition
  'elevated',        -- Elevated access with additional permissions
  'restricted'       -- Restricted access with limited permissions
);

-- ============================================================================
-- 2. EVENT ROLE DEFINITIONS TABLE
-- ============================================================================

-- Event role definitions (what each role can do)
CREATE TABLE IF NOT EXISTS event_role_definitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_type event_role_type NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  base_team_role team_role NOT NULL, -- Maps to core team role for RLS
  default_permissions jsonb DEFAULT '{}',
  
  -- Quick access flags
  can_view_financials boolean DEFAULT false,
  can_view_attendees boolean DEFAULT false,
  can_manage_content boolean DEFAULT false,
  can_scan_tickets boolean DEFAULT false,
  can_view_analytics boolean DEFAULT false,
  can_manage_schedule boolean DEFAULT false,
  
  -- Display settings
  badge_color text,
  badge_icon text,
  
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. ENHANCE EVENT TEAM ASSIGNMENTS
-- ============================================================================

-- Add event-specific role columns to existing table
ALTER TABLE event_team_assignments 
  ADD COLUMN IF NOT EXISTS event_role_type event_role_type,
  ADD COLUMN IF NOT EXISTS access_level event_access_level DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS specific_permissions jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS access_start_date timestamptz,
  ADD COLUMN IF NOT EXISTS access_end_date timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_team_role_type ON event_team_assignments(event_role_type);
CREATE INDEX IF NOT EXISTS idx_event_team_access_level ON event_team_assignments(access_level);
CREATE INDEX IF NOT EXISTS idx_event_team_access_dates ON event_team_assignments(access_start_date, access_end_date);

-- ============================================================================
-- 4. EVENT ROLE PERMISSIONS TRACKING
-- ============================================================================

-- Track permission usage for analytics
CREATE TABLE IF NOT EXISTS event_role_permission_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id uuid REFERENCES event_team_assignments(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  action_type text NOT NULL, -- viewed, created, updated, deleted, exported
  resource_type text, -- what was accessed
  resource_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_role_usage_assignment ON event_role_permission_usage(assignment_id);
CREATE INDEX IF NOT EXISTS idx_role_usage_permission ON event_role_permission_usage(permission_key);
CREATE INDEX IF NOT EXISTS idx_role_usage_created ON event_role_permission_usage(created_at);

-- ============================================================================
-- 5. ENABLE RLS
-- ============================================================================

ALTER TABLE event_role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_role_permission_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- Event role definitions: Anyone can view active roles
DROP POLICY IF EXISTS "Anyone can view active event role definitions" ON event_role_definitions;
CREATE POLICY "Anyone can view active event role definitions" ON event_role_definitions
  FOR SELECT USING (is_active = true);

-- Admins can manage event role definitions
DROP POLICY IF EXISTS "Admins can manage event role definitions" ON event_role_definitions;
CREATE POLICY "Admins can manage event role definitions" ON event_role_definitions
  FOR ALL USING (is_super_admin(auth.uid()));

-- Permission usage: Team members can view their own
DROP POLICY IF EXISTS "Users can view their own permission usage" ON event_role_permission_usage;
CREATE POLICY "Users can view their own permission usage" ON event_role_permission_usage
  FOR SELECT USING (
    assignment_id IN (
      SELECT id FROM event_team_assignments WHERE user_id = auth.uid()
    )
  );

-- Admins can view all permission usage
DROP POLICY IF EXISTS "Admins can view all permission usage" ON event_role_permission_usage;
CREATE POLICY "Admins can view all permission usage" ON event_role_permission_usage
  FOR SELECT USING (is_super_admin(auth.uid()));

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Get user's event-specific role
CREATE OR REPLACE FUNCTION get_user_event_role(
  p_user_id uuid,
  p_event_id uuid
)
RETURNS event_role_type AS $$
DECLARE
  v_role event_role_type;
BEGIN
  SELECT event_role_type INTO v_role
  FROM event_team_assignments
  WHERE user_id = p_user_id
    AND event_id = p_event_id
    AND removed_at IS NULL
    AND (access_start_date IS NULL OR access_start_date <= now())
    AND (access_end_date IS NULL OR access_end_date > now());
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has active event assignment
CREATE OR REPLACE FUNCTION has_active_event_assignment(
  p_user_id uuid,
  p_event_id uuid
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM event_team_assignments
    WHERE user_id = p_user_id
      AND event_id = p_event_id
      AND removed_at IS NULL
      AND (access_start_date IS NULL OR access_start_date <= now())
      AND (access_end_date IS NULL OR access_end_date > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check event-specific permission
CREATE OR REPLACE FUNCTION has_event_permission(
  p_user_id uuid,
  p_event_id uuid,
  p_permission_key text
)
RETURNS boolean AS $$
DECLARE
  v_has_permission boolean := false;
  v_role_type event_role_type;
  v_default_perms jsonb;
  v_specific_perms jsonb;
  v_access_level event_access_level;
BEGIN
  -- Check if user is super admin (bypass all checks)
  IF is_super_admin(p_user_id) THEN
    RETURN true;
  END IF;
  
  -- Check if user can manage this event (bypass role checks)
  IF can_manage_event(p_user_id, p_event_id) THEN
    RETURN true;
  END IF;
  
  -- Get user's event role and access level
  SELECT event_role_type, access_level, specific_permissions 
  INTO v_role_type, v_access_level, v_specific_perms
  FROM event_team_assignments
  WHERE user_id = p_user_id
    AND event_id = p_event_id
    AND removed_at IS NULL
    AND (access_start_date IS NULL OR access_start_date <= now())
    AND (access_end_date IS NULL OR access_end_date > now());
  
  IF v_role_type IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check specific permissions first (highest priority)
  IF v_specific_perms ? p_permission_key THEN
    RETURN (v_specific_perms->p_permission_key)::boolean;
  END IF;
  
  -- Check default role permissions
  SELECT default_permissions INTO v_default_perms
  FROM event_role_definitions
  WHERE role_type = v_role_type;
  
  IF v_default_perms ? p_permission_key THEN
    v_has_permission := (v_default_perms->p_permission_key)::boolean;
    
    -- Apply access level modifiers
    IF v_access_level = 'restricted' THEN
      -- Restricted access: only allow explicitly granted permissions
      RETURN v_has_permission AND (v_specific_perms ? p_permission_key);
    ELSIF v_access_level = 'elevated' THEN
      -- Elevated access: grant permission if default allows
      RETURN v_has_permission;
    ELSE
      -- Standard access: use default permissions
      RETURN v_has_permission;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get all event permissions for user
CREATE OR REPLACE FUNCTION get_user_event_permissions(
  p_user_id uuid,
  p_event_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_role_type event_role_type;
  v_default_perms jsonb;
  v_specific_perms jsonb;
  v_merged_perms jsonb;
BEGIN
  -- Get user's event role
  SELECT event_role_type, specific_permissions 
  INTO v_role_type, v_specific_perms
  FROM event_team_assignments
  WHERE user_id = p_user_id
    AND event_id = p_event_id
    AND removed_at IS NULL;
  
  IF v_role_type IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;
  
  -- Get default permissions
  SELECT default_permissions INTO v_default_perms
  FROM event_role_definitions
  WHERE role_type = v_role_type;
  
  -- Merge permissions (specific overrides default)
  v_merged_perms := COALESCE(v_default_perms, '{}'::jsonb) || COALESCE(v_specific_perms, '{}'::jsonb);
  
  RETURN v_merged_perms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Log permission usage
CREATE OR REPLACE FUNCTION log_event_permission_usage(
  p_user_id uuid,
  p_event_id uuid,
  p_permission_key text,
  p_action_type text,
  p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_assignment_id uuid;
BEGIN
  -- Get assignment ID
  SELECT id INTO v_assignment_id
  FROM event_team_assignments
  WHERE user_id = p_user_id
    AND event_id = p_event_id
    AND removed_at IS NULL;
  
  IF v_assignment_id IS NOT NULL THEN
    INSERT INTO event_role_permission_usage (
      assignment_id,
      permission_key,
      action_type,
      resource_type,
      resource_id,
      ip_address,
      user_agent
    ) VALUES (
      v_assignment_id,
      p_permission_key,
      p_action_type,
      p_resource_type,
      p_resource_id,
      inet_client_addr(),
      current_setting('request.headers', true)::json->>'user-agent'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
DROP TRIGGER IF EXISTS update_event_role_definitions_updated_at ON event_role_definitions;
CREATE TRIGGER update_event_role_definitions_updated_at
  BEFORE UPDATE ON event_role_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. SEED DATA - EVENT ROLE DEFINITIONS
-- ============================================================================

INSERT INTO event_role_definitions (
  role_type, 
  display_name, 
  description, 
  base_team_role,
  can_view_financials,
  can_view_attendees,
  can_manage_content,
  can_scan_tickets,
  can_view_analytics,
  can_manage_schedule,
  badge_color,
  badge_icon,
  default_permissions
) VALUES
  (
    'event_lead',
    'Event Lead',
    'Lead coordinator for the event with elevated permissions',
    'lead',
    true,
    true,
    true,
    true,
    true,
    true,
    '#8B5CF6',
    'shield-check',
    jsonb_build_object(
      'can_assign_staff', true,
      'can_approve_changes', true,
      'can_view_schedule', true,
      'can_edit_schedule', true,
      'can_view_financials', true,
      'can_view_attendees', true,
      'can_manage_content', true,
      'can_scan_tickets', true,
      'can_check_in', true,
      'can_validate_tickets', true,
      'can_view_analytics', true,
      'can_export_reports', true,
      'can_manage_team', true
    )
  ),
  (
    'event_staff',
    'Event Staff',
    'On-site event staff member with operational access',
    'team',
    false,
    false,
    false,
    true,
    false,
    false,
    '#10B981',
    'user-check',
    jsonb_build_object(
      'can_check_in', true,
      'can_validate_tickets', true,
      'can_scan_tickets', true,
      'can_view_schedule', true,
      'can_view_capacity', true,
      'can_handle_will_call', true
    )
  ),
  (
    'vendor',
    'Vendor',
    'Event vendor with limited content and schedule access',
    'collaborator',
    false,
    false,
    true,
    false,
    false,
    false,
    '#F59E0B',
    'briefcase',
    jsonb_build_object(
      'can_view_schedule', true,
      'can_upload_assets', true,
      'can_view_vendor_info', true,
      'can_manage_own_content', true,
      'can_view_load_in_times', true
    )
  ),
  (
    'talent',
    'Talent',
    'Performing artist or talent with schedule and media access',
    'collaborator',
    false,
    false,
    true,
    false,
    false,
    false,
    '#EC4899',
    'music',
    jsonb_build_object(
      'can_view_schedule', true,
      'can_view_rider', true,
      'can_upload_media', true,
      'can_view_set_time', true,
      'can_view_stage_info', true,
      'can_manage_own_content', true,
      'can_view_hospitality', true
    )
  ),
  (
    'agent',
    'Agent',
    'Talent agent or representative with contract access',
    'collaborator',
    false,
    false,
    false,
    false,
    false,
    false,
    '#6366F1',
    'user-tie',
    jsonb_build_object(
      'can_view_schedule', true,
      'can_view_contracts', true,
      'can_view_rider', true,
      'can_view_payment_schedule', true,
      'can_communicate_with_production', true
    )
  ),
  (
    'sponsor',
    'Sponsor',
    'Event sponsor with analytics and demographic access',
    'partner',
    false,
    true,
    false,
    false,
    true,
    false,
    '#3B82F6',
    'award',
    jsonb_build_object(
      'can_view_analytics', true,
      'can_view_demographics', true,
      'can_view_attendees', true,
      'can_view_engagement', true,
      'can_export_reports', true,
      'can_view_brand_exposure', true
    )
  ),
  (
    'media',
    'Media',
    'Media/Press with credential and content access',
    'partner',
    false,
    false,
    true,
    false,
    false,
    false,
    '#EF4444',
    'camera',
    jsonb_build_object(
      'can_view_schedule', true,
      'can_download_media', true,
      'can_upload_content', true,
      'can_view_press_kit', true,
      'can_access_media_area', true,
      'can_request_interviews', true
    )
  ),
  (
    'investor',
    'Investor',
    'Financial investor with comprehensive reporting access',
    'partner',
    true,
    false,
    false,
    false,
    true,
    false,
    '#059669',
    'trending-up',
    jsonb_build_object(
      'can_view_financials', true,
      'can_view_analytics', true,
      'can_export_reports', true,
      'can_view_revenue', true,
      'can_view_expenses', true,
      'can_view_projections', true,
      'can_view_roi', true
    )
  ),
  (
    'stakeholder',
    'Stakeholder',
    'General stakeholder with read-only access',
    'partner',
    false,
    false,
    false,
    false,
    true,
    false,
    '#6B7280',
    'users',
    jsonb_build_object(
      'can_view_schedule', true,
      'can_view_basic_analytics', true,
      'can_view_event_status', true,
      'can_receive_updates', true
    )
  )
ON CONFLICT (role_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  base_team_role = EXCLUDED.base_team_role,
  can_view_financials = EXCLUDED.can_view_financials,
  can_view_attendees = EXCLUDED.can_view_attendees,
  can_manage_content = EXCLUDED.can_manage_content,
  can_scan_tickets = EXCLUDED.can_scan_tickets,
  can_view_analytics = EXCLUDED.can_view_analytics,
  can_manage_schedule = EXCLUDED.can_manage_schedule,
  badge_color = EXCLUDED.badge_color,
  badge_icon = EXCLUDED.badge_icon,
  default_permissions = EXCLUDED.default_permissions,
  updated_at = now();

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================

COMMENT ON TYPE event_role_type IS 'Event-specific role types for contextual access control';
COMMENT ON TYPE event_access_level IS 'Access level modifiers: standard, elevated, or restricted';
COMMENT ON TABLE event_role_definitions IS 'Defines permissions and capabilities for each event role type';
COMMENT ON TABLE event_role_permission_usage IS 'Tracks permission usage for analytics and auditing';
COMMENT ON FUNCTION get_user_event_role IS 'Get user''s event-specific role for a given event';
COMMENT ON FUNCTION has_event_permission IS 'Check if user has specific permission for an event';
COMMENT ON FUNCTION get_user_event_permissions IS 'Get all permissions for user in an event';
COMMENT ON FUNCTION log_event_permission_usage IS 'Log permission usage for analytics';
