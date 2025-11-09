/**
 * RBAC Permission Management
 * Utilities for checking and managing permissions
 */

import { createClient } from '@/lib/supabase/client';
import {
  MemberRole,
  TeamRole,
  PermissionAction,
  ResourceType,
  PermissionContext,
  TEAM_ROLE_HIERARCHY,
  MEMBER_ROLE_HIERARCHY
} from './types';

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  resourceName: string,
  action: PermissionAction,
  scopeContext?: Record<string, any>
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('has_permission', {
    p_user_id: userId,
    p_resource_name: resourceName,
    p_action: action,
    p_scope_context: scopeContext || {}
  });

  if (error) {
    console.error('Error checking permission:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user is a team member
 */
export async function isTeamMember(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('is_team_member', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error checking team member status:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user is legend (platform owner)
 */
export async function isLegend(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('is_legend', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error checking legend status:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('is_super_admin', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user can manage a specific event
 */
export async function canManageEvent(userId: string, eventId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('can_manage_event', {
    p_user_id: userId,
    p_event_id: eventId
  });

  if (error) {
    console.error('Error checking event management permission:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user can manage a specific brand
 */
export async function canManageBrand(userId: string, brandId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('can_manage_brand', {
    p_user_id: userId,
    p_brand_id: brandId
  });

  if (error) {
    console.error('Error checking brand management permission:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user has active membership
 */
export async function hasActiveMembership(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('has_active_membership', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error checking membership status:', error);
    return false;
  }

  return data === true;
}

/**
 * Check if user has ticket for event
 */
export async function hasEventTicket(userId: string, eventId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('has_event_ticket', {
    p_user_id: userId,
    p_event_id: eventId
  });

  if (error) {
    console.error('Error checking event ticket:', error);
    return false;
  }

  return data === true;
}

/**
 * Get user's team role
 */
export async function getUserTeamRole(userId: string): Promise<TeamRole | null> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_user_team_role', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error getting team role:', error);
    return null;
  }

  return data as TeamRole | null;
}

/**
 * Get user's member role
 */
export async function getUserMemberRole(userId: string): Promise<MemberRole> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_user_member_role', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error getting member role:', error);
    return MemberRole.GUEST;
  }

  return (data as MemberRole) || MemberRole.GUEST;
}

/**
 * Compare team role hierarchy
 */
export function isTeamRoleHigherOrEqual(role1: TeamRole, role2: TeamRole): boolean {
  return TEAM_ROLE_HIERARCHY[role1] >= TEAM_ROLE_HIERARCHY[role2];
}

/**
 * Compare member role hierarchy
 */
export function isMemberRoleHigherOrEqual(role1: MemberRole, role2: MemberRole): boolean {
  return MEMBER_ROLE_HIERARCHY[role1] >= MEMBER_ROLE_HIERARCHY[role2];
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('rbac_user_permissions')
    .select(`
      *,
      permission:rbac_permissions(
        *,
        resource:rbac_resources(*)
      )
    `)
    .eq('user_id', userId)
    .or('expires_at.is.null,expires_at.gt.now()');

  if (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }

  return data || [];
}

/**
 * Grant permission to user
 */
export async function grantUserPermission(
  userId: string,
  permissionId: string,
  grantedBy: string,
  scopeContext?: Record<string, any>,
  expiresAt?: string,
  reason?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('rbac_user_permissions')
    .insert({
      user_id: userId,
      permission_id: permissionId,
      granted: true,
      scope_context: scopeContext || {},
      granted_by: grantedBy,
      expires_at: expiresAt,
      reason
    })
    .select()
    .single();

  if (error) {
    console.error('Error granting permission:', error);
    throw error;
  }

  return data;
}

/**
 * Revoke permission from user
 */
export async function revokeUserPermission(
  userId: string,
  permissionId: string,
  revokedBy: string,
  reason?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('rbac_user_permissions')
    .update({
      granted: false,
      reason
    })
    .eq('user_id', userId)
    .eq('permission_id', permissionId)
    .select()
    .single();

  if (error) {
    console.error('Error revoking permission:', error);
    throw error;
  }

  return data;
}

/**
 * Assign user to event team
 */
export async function assignToEventTeam(
  eventId: string,
  userId: string,
  teamRole: TeamRole,
  assignedBy: string,
  department?: string,
  responsibilities?: string[],
  canManageTeam: boolean = false
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_team_assignments')
    .insert({
      event_id: eventId,
      user_id: userId,
      team_role: teamRole,
      department,
      responsibilities,
      can_manage_team: canManageTeam,
      assigned_by: assignedBy
    })
    .select()
    .single();

  if (error) {
    console.error('Error assigning to event team:', error);
    throw error;
  }

  return data;
}

/**
 * Remove user from event team
 */
export async function removeFromEventTeam(eventId: string, userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_team_assignments')
    .update({ removed_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error removing from event team:', error);
    throw error;
  }

  return data;
}

/**
 * Assign user to brand team
 */
export async function assignToBrandTeam(
  brandId: string,
  userId: string,
  teamRole: TeamRole,
  assignedBy: string,
  department?: string,
  canManageBrand: boolean = false,
  canCreateEvents: boolean = false
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('brand_team_assignments')
    .insert({
      brand_id: brandId,
      user_id: userId,
      team_role: teamRole,
      department,
      can_manage_brand: canManageBrand,
      can_create_events: canCreateEvents,
      assigned_by: assignedBy
    })
    .select()
    .single();

  if (error) {
    console.error('Error assigning to brand team:', error);
    throw error;
  }

  return data;
}

/**
 * Remove user from brand team
 */
export async function removeFromBrandTeam(brandId: string, userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('brand_team_assignments')
    .update({ removed_at: new Date().toISOString() })
    .eq('brand_id', brandId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error removing from brand team:', error);
    throw error;
  }

  return data;
}

/**
 * Batch permission check
 */
export async function checkMultiplePermissions(
  userId: string,
  checks: Array<{ resourceName: string; action: PermissionAction; scopeContext?: Record<string, any> }>
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  await Promise.all(
    checks.map(async (check) => {
      const key = `${check.resourceName}.${check.action}`;
      results[key] = await hasPermission(
        userId,
        check.resourceName,
        check.action,
        check.scopeContext
      );
    })
  );

  return results;
}
