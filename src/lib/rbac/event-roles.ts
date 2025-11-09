/**
 * Event-Specific Roles Management
 * Contextual role assignments for event-scoped access control
 */

import { createClient } from '@/lib/supabase/client';
import { TeamRole } from './types';

// Event role types
export enum EventRoleType {
  EVENT_LEAD = 'event_lead',
  EVENT_STAFF = 'event_staff',
  VENDOR = 'vendor',
  TALENT = 'talent',
  AGENT = 'agent',
  SPONSOR = 'sponsor',
  MEDIA = 'media',
  INVESTOR = 'investor',
  STAKEHOLDER = 'stakeholder'
}

// Access levels
export enum EventAccessLevel {
  STANDARD = 'standard',
  ELEVATED = 'elevated',
  RESTRICTED = 'restricted'
}

// Event role definition
export interface EventRoleDefinition {
  id: string;
  role_type: EventRoleType;
  display_name: string;
  description?: string;
  base_team_role: TeamRole;
  default_permissions: Record<string, boolean>;
  can_view_financials: boolean;
  can_view_attendees: boolean;
  can_manage_content: boolean;
  can_scan_tickets: boolean;
  can_view_analytics: boolean;
  can_manage_schedule: boolean;
  badge_color?: string;
  badge_icon?: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Enhanced event team assignment
export interface EnhancedEventTeamAssignment {
  id: string;
  event_id: string;
  user_id: string;
  team_role: TeamRole;
  event_role_type?: EventRoleType;
  department?: string;
  responsibilities?: string[];
  can_manage_team: boolean;
  access_level?: EventAccessLevel;
  specific_permissions?: Record<string, boolean>;
  access_start_date?: string;
  access_end_date?: string;
  notes?: string;
  contact_info?: Record<string, any>;
  assigned_by?: string;
  assigned_at: string;
  removed_at?: string;
}

// Permission usage tracking
export interface EventRolePermissionUsage {
  id: string;
  assignment_id: string;
  permission_key: string;
  action_type: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Display names for event roles
export const EVENT_ROLE_DISPLAY: Record<EventRoleType, string> = {
  [EventRoleType.EVENT_LEAD]: 'Event Lead',
  [EventRoleType.EVENT_STAFF]: 'Event Staff',
  [EventRoleType.VENDOR]: 'Vendor',
  [EventRoleType.TALENT]: 'Talent',
  [EventRoleType.AGENT]: 'Agent',
  [EventRoleType.SPONSOR]: 'Sponsor',
  [EventRoleType.MEDIA]: 'Media',
  [EventRoleType.INVESTOR]: 'Investor',
  [EventRoleType.STAKEHOLDER]: 'Stakeholder'
};

// Role descriptions
export const EVENT_ROLE_DESCRIPTIONS: Record<EventRoleType, string> = {
  [EventRoleType.EVENT_LEAD]: 'Lead coordinator with elevated permissions',
  [EventRoleType.EVENT_STAFF]: 'On-site staff with operational access',
  [EventRoleType.VENDOR]: 'Vendor with content and schedule access',
  [EventRoleType.TALENT]: 'Performing artist with media access',
  [EventRoleType.AGENT]: 'Talent representative with contract access',
  [EventRoleType.SPONSOR]: 'Sponsor with analytics access',
  [EventRoleType.MEDIA]: 'Media/Press with content access',
  [EventRoleType.INVESTOR]: 'Investor with financial reporting access',
  [EventRoleType.STAKEHOLDER]: 'Stakeholder with read-only access'
};

/**
 * Get all event role definitions
 */
export async function getEventRoleDefinitions(): Promise<EventRoleDefinition[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_role_definitions')
    .select('*')
    .eq('is_active', true)
    .order('display_name');

  if (error) {
    console.error('Error fetching event role definitions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get specific event role definition
 */
export async function getEventRoleDefinition(
  roleType: EventRoleType
): Promise<EventRoleDefinition | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_role_definitions')
    .select('*')
    .eq('role_type', roleType)
    .single();

  if (error) {
    console.error('Error fetching event role definition:', error);
    return null;
  }

  return data;
}

/**
 * Get user's event-specific role
 */
export async function getUserEventRole(
  userId: string,
  eventId: string
): Promise<EventRoleType | null> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_user_event_role', {
    p_user_id: userId,
    p_event_id: eventId
  });

  if (error) {
    console.error('Error getting user event role:', error);
    return null;
  }

  return data as EventRoleType | null;
}

/**
 * Check if user has active event assignment
 */
export async function hasActiveEventAssignment(
  userId: string,
  eventId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('has_active_event_assignment', {
    p_user_id: userId,
    p_event_id: eventId
  });

  if (error) {
    console.error('Error checking event assignment:', error);
    return false;
  }

  return data === true;
}

/**
 * Check event-specific permission
 */
export async function hasEventPermission(
  userId: string,
  eventId: string,
  permissionKey: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('has_event_permission', {
    p_user_id: userId,
    p_event_id: eventId,
    p_permission_key: permissionKey
  });

  if (error) {
    console.error('Error checking event permission:', error);
    return false;
  }

  return data === true;
}

/**
 * Get all event permissions for user
 */
export async function getUserEventPermissions(
  userId: string,
  eventId: string
): Promise<Record<string, boolean>> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_user_event_permissions', {
    p_user_id: userId,
    p_event_id: eventId
  });

  if (error) {
    console.error('Error getting event permissions:', error);
    return {};
  }

  return (data as Record<string, boolean>) || {};
}

/**
 * Assign user to event with specific role
 */
export async function assignEventRole(
  eventId: string,
  userId: string,
  eventRoleType: EventRoleType,
  assignedBy: string,
  options?: {
    department?: string;
    responsibilities?: string[];
    canManageTeam?: boolean;
    accessLevel?: EventAccessLevel;
    specificPermissions?: Record<string, boolean>;
    accessStartDate?: string;
    accessEndDate?: string;
    notes?: string;
    contactInfo?: Record<string, any>;
  }
): Promise<EnhancedEventTeamAssignment | null> {
  const supabase = createClient();

  // Get the base team role for this event role
  const roleDefinition = await getEventRoleDefinition(eventRoleType);
  if (!roleDefinition) {
    throw new Error(`Event role definition not found for ${eventRoleType}`);
  }

  const { data, error } = await supabase
    .from('event_team_assignments')
    .insert({
      event_id: eventId,
      user_id: userId,
      team_role: roleDefinition.base_team_role,
      event_role_type: eventRoleType,
      department: options?.department,
      responsibilities: options?.responsibilities,
      can_manage_team: options?.canManageTeam || false,
      access_level: options?.accessLevel || EventAccessLevel.STANDARD,
      specific_permissions: options?.specificPermissions || {},
      access_start_date: options?.accessStartDate,
      access_end_date: options?.accessEndDate,
      notes: options?.notes,
      contact_info: options?.contactInfo || {},
      assigned_by: assignedBy
    })
    .select()
    .single();

  if (error) {
    console.error('Error assigning event role:', error);
    throw error;
  }

  return data;
}

/**
 * Update event role assignment
 */
export async function updateEventRoleAssignment(
  assignmentId: string,
  updates: {
    eventRoleType?: EventRoleType;
    accessLevel?: EventAccessLevel;
    specificPermissions?: Record<string, boolean>;
    accessStartDate?: string;
    accessEndDate?: string;
    notes?: string;
    contactInfo?: Record<string, any>;
  }
): Promise<EnhancedEventTeamAssignment | null> {
  const supabase = createClient();

  const updateData: any = {};

  if (updates.eventRoleType) {
    updateData.event_role_type = updates.eventRoleType;
    
    // Update base team role if event role type changes
    const roleDefinition = await getEventRoleDefinition(updates.eventRoleType);
    if (roleDefinition) {
      updateData.team_role = roleDefinition.base_team_role;
    }
  }

  if (updates.accessLevel) updateData.access_level = updates.accessLevel;
  if (updates.specificPermissions) updateData.specific_permissions = updates.specificPermissions;
  if (updates.accessStartDate !== undefined) updateData.access_start_date = updates.accessStartDate;
  if (updates.accessEndDate !== undefined) updateData.access_end_date = updates.accessEndDate;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.contactInfo) updateData.contact_info = updates.contactInfo;

  const { data, error } = await supabase
    .from('event_team_assignments')
    .update(updateData)
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating event role assignment:', error);
    throw error;
  }

  return data;
}

/**
 * Remove event role assignment
 */
export async function removeEventRoleAssignment(
  assignmentId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('event_team_assignments')
    .update({ removed_at: new Date().toISOString() })
    .eq('id', assignmentId);

  if (error) {
    console.error('Error removing event role assignment:', error);
    throw error;
  }
}

/**
 * Get all event team members with their roles
 */
export async function getEventTeamMembers(
  eventId: string
): Promise<EnhancedEventTeamAssignment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_team_assignments')
    .select(`
      *,
      user:user_profiles(
        id,
        display_name,
        avatar_url,
        email
      )
    `)
    .eq('event_id', eventId)
    .is('removed_at', null)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching event team members:', error);
    return [];
  }

  return data || [];
}

/**
 * Get event team members by role type
 */
export async function getEventTeamMembersByRole(
  eventId: string,
  roleType: EventRoleType
): Promise<EnhancedEventTeamAssignment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_team_assignments')
    .select(`
      *,
      user:user_profiles(
        id,
        display_name,
        avatar_url,
        email
      )
    `)
    .eq('event_id', eventId)
    .eq('event_role_type', roleType)
    .is('removed_at', null)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching event team members by role:', error);
    return [];
  }

  return data || [];
}

/**
 * Log permission usage
 */
export async function logEventPermissionUsage(
  userId: string,
  eventId: string,
  permissionKey: string,
  actionType: string,
  resourceType?: string,
  resourceId?: string
): Promise<void> {
  const supabase = createClient();

  await supabase.rpc('log_event_permission_usage', {
    p_user_id: userId,
    p_event_id: eventId,
    p_permission_key: permissionKey,
    p_action_type: actionType,
    p_resource_type: resourceType,
    p_resource_id: resourceId
  });
}

/**
 * Batch check multiple event permissions
 */
export async function checkMultipleEventPermissions(
  userId: string,
  eventId: string,
  permissionKeys: string[]
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  await Promise.all(
    permissionKeys.map(async (key) => {
      results[key] = await hasEventPermission(userId, eventId, key);
    })
  );

  return results;
}
