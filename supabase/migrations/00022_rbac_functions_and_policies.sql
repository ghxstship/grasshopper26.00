-- ============================================================================
-- RBAC HELPER FUNCTIONS AND RLS POLICIES
-- Part 2 of Enterprise RBAC System
-- ============================================================================

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Get user's effective team role
CREATE OR REPLACE FUNCTION get_user_team_role(p_user_id uuid)
RETURNS team_role AS $$
DECLARE
  v_role team_role;
BEGIN
  SELECT team_role INTO v_role
  FROM user_profiles
  WHERE id = p_user_id AND is_team_member = true;
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's member role
CREATE OR REPLACE FUNCTION get_user_member_role(p_user_id uuid)
RETURNS member_role AS $$
DECLARE
  v_role member_role;
BEGIN
  SELECT member_role INTO v_role
  FROM user_profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_role, 'guest'::member_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is team member
CREATE OR REPLACE FUNCTION is_team_member(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id AND is_team_member = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is legend (platform owner)
CREATE OR REPLACE FUNCTION is_legend(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id AND team_role = 'legend'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_user_id AND team_role IN ('legend', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has permission for resource
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id uuid,
  p_resource_name text,
  p_action permission_action,
  p_scope_context jsonb DEFAULT '{}'
)
RETURNS boolean AS $$
DECLARE
  v_has_permission boolean := false;
  v_team_role team_role;
  v_member_role member_role;
  v_resource_id uuid;
BEGIN
  -- Legend has all permissions
  IF is_legend(p_user_id) THEN
    RETURN true;
  END IF;
  
  -- Get resource ID
  SELECT id INTO v_resource_id
  FROM rbac_resources
  WHERE resource_name = p_resource_name;
  
  IF v_resource_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check user-specific permission overrides first
  SELECT granted INTO v_has_permission
  FROM rbac_user_permissions up
  JOIN rbac_permissions p ON up.permission_id = p.id
  WHERE up.user_id = p_user_id
    AND p.resource_id = v_resource_id
    AND p.action = p_action
    AND (up.expires_at IS NULL OR up.expires_at > now())
    AND (up.scope_context IS NULL OR up.scope_context @> p_scope_context);
  
  IF v_has_permission IS NOT NULL THEN
    RETURN v_has_permission;
  END IF;
  
  -- Get user roles
  SELECT team_role, member_role INTO v_team_role, v_member_role
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Check team role permissions
  IF v_team_role IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1
      FROM rbac_role_permissions rp
      JOIN rbac_permissions p ON rp.permission_id = p.id
      WHERE rp.role_type = 'team'
        AND rp.role_name = v_team_role::text
        AND p.resource_id = v_resource_id
        AND p.action = p_action
        AND rp.granted = true
    ) INTO v_has_permission;
    
    IF v_has_permission THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Check member role permissions
  IF v_member_role IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1
      FROM rbac_role_permissions rp
      JOIN rbac_permissions p ON rp.permission_id = p.id
      WHERE rp.role_type = 'member'
        AND rp.role_name = v_member_role::text
        AND p.resource_id = v_resource_id
        AND p.action = p_action
        AND rp.granted = true
    ) INTO v_has_permission;
  END IF;
  
  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user can manage event
CREATE OR REPLACE FUNCTION can_manage_event(p_user_id uuid, p_event_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Legend and super admin can manage all events
  IF is_super_admin(p_user_id) THEN
    RETURN true;
  END IF;
  
  -- Event team assignment check will be added after event_team_assignments table is created in migration 00029
  -- For now, only super admins can manage events
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user can manage brand
CREATE OR REPLACE FUNCTION can_manage_brand(p_user_id uuid, p_brand_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Legend and super admin can manage all brands
  IF is_super_admin(p_user_id) THEN
    RETURN true;
  END IF;
  
  -- Check brand team assignment
  RETURN EXISTS (
    SELECT 1 FROM brand_team_assignments
    WHERE brand_id = p_brand_id
      AND user_id = p_user_id
      AND team_role IN ('admin', 'super_admin')
      AND can_manage_brand = true
      AND removed_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has active membership
CREATE OR REPLACE FUNCTION has_active_membership(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_memberships
    WHERE user_id = p_user_id
      AND status = 'active'
      AND (renewal_date IS NULL OR renewal_date > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has ticket for event
CREATE OR REPLACE FUNCTION has_event_ticket(p_user_id uuid, p_event_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tickets t
    JOIN orders o ON t.order_id = o.id
    WHERE o.user_id = p_user_id
      AND o.event_id = p_event_id
      AND t.status = 'active'
      AND o.status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Log permission change
CREATE OR REPLACE FUNCTION log_permission_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rbac_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    old_value,
    new_value,
    performed_by
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW),
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. RLS POLICIES - RBAC TABLES
-- ============================================================================

-- Resources: Team members can view, admins can manage
DROP POLICY IF EXISTS "Team members can view resources" ON rbac_resources;
CREATE POLICY "Team members can view resources" ON rbac_resources
  FOR SELECT USING (is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage resources" ON rbac_resources;
CREATE POLICY "Admins can manage resources" ON rbac_resources
  FOR ALL USING (is_super_admin(auth.uid()));

-- Permissions: Team members can view, admins can manage
DROP POLICY IF EXISTS "Team members can view permissions" ON rbac_permissions;
CREATE POLICY "Team members can view permissions" ON rbac_permissions
  FOR SELECT USING (is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage permissions" ON rbac_permissions;
CREATE POLICY "Admins can manage permissions" ON rbac_permissions
  FOR ALL USING (is_super_admin(auth.uid()));

-- Role permissions: Team members can view, admins can manage
DROP POLICY IF EXISTS "Team members can view role permissions" ON rbac_role_permissions;
CREATE POLICY "Team members can view role permissions" ON rbac_role_permissions
  FOR SELECT USING (is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage role permissions" ON rbac_role_permissions;
CREATE POLICY "Admins can manage role permissions" ON rbac_role_permissions
  FOR ALL USING (is_super_admin(auth.uid()));

-- User permissions: Users can view their own, admins can manage all
DROP POLICY IF EXISTS "Users can view their own permissions" ON rbac_user_permissions;
CREATE POLICY "Users can view their own permissions" ON rbac_user_permissions
  FOR SELECT USING (auth.uid() = user_id OR is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage user permissions" ON rbac_user_permissions;
CREATE POLICY "Admins can manage user permissions" ON rbac_user_permissions
  FOR ALL USING (is_super_admin(auth.uid()));

-- Event team assignments policies (moved to after 00029_event_team_management.sql)

-- Brand team assignments
DROP POLICY IF EXISTS "Users can view brand team assignments" ON brand_team_assignments;
CREATE POLICY "Users can view brand team assignments" ON brand_team_assignments
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_team_member(auth.uid()) OR
    can_manage_brand(auth.uid(), brand_id)
  );

DROP POLICY IF EXISTS "Brand admins can manage team assignments" ON brand_team_assignments;
CREATE POLICY "Brand admins can manage team assignments" ON brand_team_assignments
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    can_manage_brand(auth.uid(), brand_id)
  );

-- Departments
DROP POLICY IF EXISTS "Team members can view departments" ON departments;
CREATE POLICY "Team members can view departments" ON departments
  FOR SELECT USING (is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    can_manage_brand(auth.uid(), brand_id)
  );

-- Audit log: Admins only
DROP POLICY IF EXISTS "Admins can view audit log" ON rbac_audit_log;
CREATE POLICY "Admins can view audit log" ON rbac_audit_log
  FOR SELECT USING (is_super_admin(auth.uid()));

-- ============================================================================
-- 3. RLS POLICIES - CORE TABLES (Enhanced)
-- ============================================================================

-- Events: Enhanced access control
DROP POLICY IF EXISTS "Public can view published events" ON events;
CREATE POLICY "Public can view published events" ON events
  FOR SELECT USING (
    status IN ('upcoming', 'on_sale', 'sold_out') OR
    is_team_member(auth.uid()) OR
    can_manage_event(auth.uid(), id)
  );

DROP POLICY IF EXISTS "Team can create events" ON events;
CREATE POLICY "Team can create events" ON events
  FOR INSERT WITH CHECK (
    is_team_member(auth.uid()) AND
    has_permission(auth.uid(), 'events', 'create')
  );

DROP POLICY IF EXISTS "Team can update events" ON events;
CREATE POLICY "Team can update events" ON events
  FOR UPDATE USING (
    can_manage_event(auth.uid(), id) OR
    has_permission(auth.uid(), 'events', 'update')
  );

DROP POLICY IF EXISTS "Admins can delete events" ON events;
CREATE POLICY "Admins can delete events" ON events
  FOR DELETE USING (
    is_super_admin(auth.uid()) OR
    can_manage_event(auth.uid(), id)
  );

-- Orders: Enhanced access control
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_team_member(auth.uid()) OR
    can_manage_event(auth.uid(), event_id)
  );

DROP POLICY IF EXISTS "Team can manage orders" ON orders;
CREATE POLICY "Team can manage orders" ON orders
  FOR UPDATE USING (
    is_team_member(auth.uid()) AND
    has_permission(auth.uid(), 'orders', 'update')
  );

-- Tickets: Enhanced access control
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()) OR
    is_team_member(auth.uid())
  );

DROP POLICY IF EXISTS "Team can manage tickets" ON tickets;
CREATE POLICY "Team can manage tickets" ON tickets
  FOR ALL USING (
    is_team_member(auth.uid()) AND
    has_permission(auth.uid(), 'tickets', 'manage')
  );

-- Products: Enhanced access control
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (
    status = 'active' OR
    is_team_member(auth.uid())
  );

DROP POLICY IF EXISTS "Team can manage products" ON products;
CREATE POLICY "Team can manage products" ON products
  FOR ALL USING (
    is_team_member(auth.uid()) AND
    has_permission(auth.uid(), 'products', 'manage')
  );

-- Brands: Enhanced access control
DROP POLICY IF EXISTS "Public can view brands" ON brands;
CREATE POLICY "Public can view brands" ON brands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team can manage brands" ON brands;
CREATE POLICY "Team can manage brands" ON brands
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    can_manage_brand(auth.uid(), id)
  );

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- Audit triggers for permission changes
DROP TRIGGER IF EXISTS audit_user_permissions ON rbac_user_permissions;
CREATE TRIGGER audit_user_permissions
  AFTER INSERT OR UPDATE OR DELETE ON rbac_user_permissions
  FOR EACH ROW EXECUTE FUNCTION log_permission_change();

-- Audit trigger for event_team_assignments (moved to after 00029_event_team_management.sql)

DROP TRIGGER IF EXISTS audit_brand_team_assignments ON brand_team_assignments;
CREATE TRIGGER audit_brand_team_assignments
  AFTER INSERT OR UPDATE OR DELETE ON brand_team_assignments
  FOR EACH ROW EXECUTE FUNCTION log_permission_change();
