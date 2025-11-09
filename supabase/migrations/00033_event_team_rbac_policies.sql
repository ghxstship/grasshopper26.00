-- Event Team RBAC Policies and Functions
-- Adds RLS policies and updates functions for event_team_assignments table
-- This migration runs AFTER 00029_event_team_management.sql

-- Update can_manage_event function to include event_team_assignments check
CREATE OR REPLACE FUNCTION can_manage_event(p_user_id uuid, p_event_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Legend and super admin can manage all events
  IF is_super_admin(p_user_id) THEN
    RETURN true;
  END IF;
  
  -- Check event team assignment
  RETURN EXISTS (
    SELECT 1 FROM event_team_assignments
    WHERE event_id = p_event_id
      AND user_id = p_user_id
      AND team_role = 'lead'
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Event team assignments RLS policies
DROP POLICY IF EXISTS "Users can view event team assignments" ON event_team_assignments;
CREATE POLICY "Users can view event team assignments" ON event_team_assignments
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_team_member(auth.uid()) OR
    can_manage_event(auth.uid(), event_id)
  );

DROP POLICY IF EXISTS "Event admins can manage team assignments" ON event_team_assignments;
CREATE POLICY "Event admins can manage team assignments" ON event_team_assignments
  FOR ALL USING (
    is_super_admin(auth.uid()) OR
    can_manage_event(auth.uid(), event_id)
  );

-- Audit trigger for event_team_assignments
DROP TRIGGER IF EXISTS audit_event_team_assignments ON event_team_assignments;
CREATE TRIGGER audit_event_team_assignments
  AFTER INSERT OR UPDATE OR DELETE ON event_team_assignments
  FOR EACH ROW EXECUTE FUNCTION log_permission_change();
