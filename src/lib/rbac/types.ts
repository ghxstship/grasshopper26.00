/**
 * RBAC Type Definitions
 * Comprehensive role-based access control types
 */

// Member roles (customer-facing)
export enum MemberRole {
  MEMBER = 'member',                    // Subscribed Member (full access)
  TRIAL_MEMBER = 'trial_member',        // Trial Member (read-only, limited features)
  ATTENDEE = 'attendee',                // Ticketed Single Event Access
  GUEST = 'guest'                       // Invited Guest Single Event Access/Guest List
}

// Team roles (internal/staff)
export enum TeamRole {
  LEGEND = 'legend',                    // Platform Owner (god mode)
  SUPER_ADMIN = 'super_admin',          // Organization Level Admin
  ADMIN = 'admin',                      // Event Level Admin
  LEAD = 'lead',                        // Assignable Department Level
  TEAM = 'team',                        // Assignable Event Level Access Team Member
  COLLABORATOR = 'collaborator',        // Assignable Limited Access Team
  PARTNER = 'partner',                  // Read Only Stakeholder
  AMBASSADOR = 'ambassador'             // Brand Ambassador
}

// Permission scopes
export enum PermissionScope {
  GLOBAL = 'global',                    // Platform-wide
  ORGANIZATION = 'organization',        // Organization/brand level
  EVENT = 'event',                      // Event-specific
  DEPARTMENT = 'department',            // Department-specific
  RESOURCE = 'resource'                 // Individual resource
}

// Permission actions
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',                    // Full CRUD
  PUBLISH = 'publish',
  APPROVE = 'approve',
  ASSIGN = 'assign',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  EXPORT = 'export',
  IMPORT = 'import',
  CONFIGURE = 'configure'
}

// Resource types
export enum ResourceType {
  EVENTS = 'events',
  ORDERS = 'orders',
  TICKETS = 'tickets',
  PRODUCTS = 'products',
  BRANDS = 'brands',
  USERS = 'users',
  ARTISTS = 'artists',
  CONTENT = 'content',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  MEMBERSHIPS = 'memberships',
  REFUNDS = 'refunds'
}

// Database types
export interface RBACResource {
  id: string;
  resource_name: string;
  resource_type: string;
  description?: string;
  parent_resource_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RBACPermission {
  id: string;
  permission_name: string;
  resource_id: string;
  action: PermissionAction;
  scope: PermissionScope;
  description?: string;
  conditions?: Record<string, any>;
  created_at: string;
}

export interface RBACRolePermission {
  id: string;
  role_type: 'member' | 'team';
  role_name: string;
  permission_id: string;
  granted: boolean;
  conditions?: Record<string, any>;
  created_at: string;
}

export interface RBACUserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  granted: boolean;
  scope_context?: Record<string, any>;
  granted_by?: string;
  expires_at?: string;
  reason?: string;
  created_at: string;
}

export interface EventTeamAssignment {
  id: string;
  event_id: string;
  user_id: string;
  team_role: TeamRole;
  department?: string;
  responsibilities?: string[];
  can_manage_team: boolean;
  assigned_by?: string;
  assigned_at: string;
  removed_at?: string;
}

export interface BrandTeamAssignment {
  id: string;
  brand_id: string;
  user_id: string;
  team_role: TeamRole;
  department?: string;
  can_manage_brand: boolean;
  can_create_events: boolean;
  assigned_by?: string;
  assigned_at: string;
  removed_at?: string;
}

export interface Department {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  description?: string;
  parent_department_id?: string;
  lead_user_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RBACAuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  performed_by?: string;
  created_at: string;
}

// Enhanced user profile with roles
export interface UserProfileWithRoles {
  id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  member_role: MemberRole;
  team_role?: TeamRole;
  is_team_member: boolean;
  department?: string;
  job_title?: string;
  permissions_override?: Record<string, any>;
  access_restrictions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Permission check context
export interface PermissionContext {
  userId: string;
  resourceName: string;
  action: PermissionAction;
  scopeContext?: Record<string, any>;
}

// Role hierarchy levels
export const TEAM_ROLE_HIERARCHY: Record<TeamRole, number> = {
  [TeamRole.LEGEND]: 100,
  [TeamRole.SUPER_ADMIN]: 90,
  [TeamRole.ADMIN]: 70,
  [TeamRole.LEAD]: 50,
  [TeamRole.TEAM]: 30,
  [TeamRole.COLLABORATOR]: 20,
  [TeamRole.PARTNER]: 10,
  [TeamRole.AMBASSADOR]: 10
};

export const MEMBER_ROLE_HIERARCHY: Record<MemberRole, number> = {
  [MemberRole.MEMBER]: 40,
  [MemberRole.TRIAL_MEMBER]: 30,
  [MemberRole.ATTENDEE]: 20,
  [MemberRole.GUEST]: 10
};

// Role display names
export const TEAM_ROLE_DISPLAY: Record<TeamRole, string> = {
  [TeamRole.LEGEND]: 'Legend',
  [TeamRole.SUPER_ADMIN]: 'Super Admin',
  [TeamRole.ADMIN]: 'Admin',
  [TeamRole.LEAD]: 'Lead',
  [TeamRole.TEAM]: 'Team Member',
  [TeamRole.COLLABORATOR]: 'Collaborator',
  [TeamRole.PARTNER]: 'Partner',
  [TeamRole.AMBASSADOR]: 'Ambassador'
};

export const MEMBER_ROLE_DISPLAY: Record<MemberRole, string> = {
  [MemberRole.MEMBER]: 'Member',
  [MemberRole.TRIAL_MEMBER]: 'Trial Member',
  [MemberRole.ATTENDEE]: 'Attendee',
  [MemberRole.GUEST]: 'Guest'
};

// Role descriptions
export const TEAM_ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  [TeamRole.LEGEND]: 'Platform Owner with full system access',
  [TeamRole.SUPER_ADMIN]: 'Organization-level administrator',
  [TeamRole.ADMIN]: 'Event-level administrator',
  [TeamRole.LEAD]: 'Department-level lead',
  [TeamRole.TEAM]: 'Event team member',
  [TeamRole.COLLABORATOR]: 'Limited access collaborator',
  [TeamRole.PARTNER]: 'Read-only stakeholder',
  [TeamRole.AMBASSADOR]: 'Brand ambassador'
};

export const MEMBER_ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  [MemberRole.MEMBER]: 'Subscribed member with full access',
  [MemberRole.TRIAL_MEMBER]: 'Trial member with limited access',
  [MemberRole.ATTENDEE]: 'Single event ticket holder',
  [MemberRole.GUEST]: 'Invited guest with limited access'
};
