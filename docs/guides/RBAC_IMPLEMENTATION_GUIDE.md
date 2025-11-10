# RBAC Implementation Guide

**GVTEWAY Platform - Enterprise Role-Based Access Control**  
**Implementation Date:** January 2025  
**Status:** ✅ Complete

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Role Hierarchy](#role-hierarchy)
3. [Database Schema](#database-schema)
4. [Permission System](#permission-system)
5. [Usage Examples](#usage-examples)
6. [Migration Guide](#migration-guide)
7. [Security Best Practices](#security-best-practices)

---

## Overview

The GVTEWAY platform implements a comprehensive Role-Based Access Control (RBAC) system with Row-Level Security (RLS) policies. The system provides:

- **Dual Role Structure**: Member roles (customer-facing) and Team roles (internal/staff)
- **Granular Permissions**: Fine-grained control over resource access
- **Scope-Based Access**: Global, organization, event, department, and resource-level permissions
- **Audit Logging**: Complete trail of all permission and role changes
- **TypeScript Support**: Fully typed utilities and React hooks

### Key Features

✅ **8 Team Roles** - From Legend (platform owner) to Ambassador (brand representative)  
✅ **4 Member Roles** - From Guest to full Member with subscriptions  
✅ **12 Resource Types** - Events, orders, tickets, products, brands, users, artists, content, analytics, settings, memberships, refunds  
✅ **13 Permission Actions** - Create, read, update, delete, manage, publish, approve, assign, transfer, refund, export, import, configure  
✅ **5 Permission Scopes** - Global, organization, event, department, resource  
✅ **Event & Brand Team Assignments** - Flexible team structure per event/brand  
✅ **Department Management** - Hierarchical department structure  
✅ **User Permission Overrides** - Individual user-level permission grants/revokes  

---

## Role Hierarchy

### Member Roles (Customer-Facing)

| Role | Enum Value | Level | Description |
|------|-----------|-------|-------------|
| **Guest** | `guest` | 10 | Invited guest with limited access to single event |
| **Attendee** | `attendee` | 20 | Ticketed user with single event access |
| **Trial Member** | `trial_member` | 30 | Trial member with read-only limited features |
| **Member** | `member` | 40 | Full subscribed member with all benefits |

### Team Roles (Internal/Staff)

| Role | Enum Value | Level | Description |
|------|-----------|-------|-------------|
| **Legend** | `legend` | 100 | Platform owner with god mode access |
| **Super Admin** | `super_admin` | 90 | Organization-level administrator |
| **Admin** | `admin` | 70 | Event-level administrator |
| **Lead** | `lead` | 50 | Department-level lead |
| **Team** | `team` | 30 | Event-level team member |
| **Collaborator** | `collaborator` | 20 | Limited access collaborator |
| **Partner** | `partner` | 10 | Read-only stakeholder |
| **Ambassador** | `ambassador` | 10 | Brand ambassador |

---

## Database Schema

### Core Tables

#### `user_profiles` (Enhanced)
```sql
ALTER TABLE user_profiles ADD COLUMN
  member_role member_role DEFAULT 'guest',
  team_role team_role,
  is_team_member boolean DEFAULT false,
  department text,
  job_title text,
  permissions_override jsonb DEFAULT '{}',
  access_restrictions jsonb DEFAULT '{}'
```

#### `rbac_resources`
Defines all protected resources in the system.

#### `rbac_permissions`
Granular permissions for resource actions with scope.

#### `rbac_role_permissions`
Maps permissions to member and team roles.

#### `rbac_user_permissions`
User-specific permission overrides with expiration and scope context.

#### `event_team_assignments`
Event-specific team member assignments.

#### `brand_team_assignments`
Brand/organization team member assignments.

#### `departments`
Organizational department structure with hierarchy.

#### `rbac_audit_log`
Comprehensive audit trail for all permission and role changes.

### Database Functions

- `get_user_team_role(user_id)` - Get user's team role
- `get_user_member_role(user_id)` - Get user's member role
- `is_team_member(user_id)` - Check if user is team member
- `is_legend(user_id)` - Check if user is platform owner
- `is_super_admin(user_id)` - Check if user is super admin
- `has_permission(user_id, resource_name, action, scope_context)` - Check permission
- `can_manage_event(user_id, event_id)` - Check event management permission
- `can_manage_brand(user_id, brand_id)` - Check brand management permission
- `has_active_membership(user_id)` - Check membership status
- `has_event_ticket(user_id, event_id)` - Check ticket ownership

---

## Permission System

### Resources

```typescript
enum ResourceType {
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
```

### Actions

```typescript
enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',      // Full CRUD
  PUBLISH = 'publish',
  APPROVE = 'approve',
  ASSIGN = 'assign',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  EXPORT = 'export',
  IMPORT = 'import',
  CONFIGURE = 'configure'
}
```

### Scopes

```typescript
enum PermissionScope {
  GLOBAL = 'global',           // Platform-wide
  ORGANIZATION = 'organization', // Organization/brand level
  EVENT = 'event',             // Event-specific
  DEPARTMENT = 'department',   // Department-specific
  RESOURCE = 'resource'        // Individual resource
}
```

### Permission Matrix

| Role | Events | Orders | Tickets | Products | Brands | Users | Analytics |
|------|--------|--------|---------|----------|--------|-------|-----------|
| **Legend** | All | All | All | All | All | All | All |
| **Super Admin** | All | All | All | All | All | All | All |
| **Admin** | CRUD | CRUD | CRUD | CRUD | R | R | R |
| **Lead** | RU | RU | RU | RU | R | R | R |
| **Team** | R | R | R | R | R | - | - |
| **Collaborator** | R | - | - | - | - | - | - |
| **Partner** | R | R | - | - | - | - | R |
| **Ambassador** | R | - | - | - | - | - | - |
| **Member** | R | R | R | R | - | - | - |
| **Trial Member** | R | - | - | - | - | - | - |
| **Attendee** | R | R | R | - | - | - | - |
| **Guest** | R | - | - | - | - | - | - |

*Legend: R=Read, C=Create, U=Update, D=Delete, All=Full Access*

---

## Usage Examples

### TypeScript/JavaScript

#### Check Permission
```typescript
import { hasPermission, PermissionAction } from '@/lib/rbac';

const canCreateEvent = await hasPermission(
  userId,
  'events',
  PermissionAction.CREATE
);
```

#### Check Event Management
```typescript
import { canManageEvent } from '@/lib/rbac';

const canManage = await canManageEvent(userId, eventId);
```

#### Assign to Event Team
```typescript
import { assignToEventTeam, TeamRole } from '@/lib/rbac';

await assignToEventTeam(
  eventId,
  userId,
  TeamRole.TEAM,
  assignedByUserId,
  'Operations',
  ['Check-in', 'Ticket scanning'],
  false
);
```

### React Hooks

#### Permission Hook
```tsx
import { usePermission, PermissionAction } from '@/lib/rbac';

function EventEditor({ eventId }) {
  const { hasAccess, loading } = usePermission(
    'events',
    PermissionAction.UPDATE
  );

  if (loading) return <Spinner />;
  if (!hasAccess) return <AccessDenied />;

  return <EventForm eventId={eventId} />;
}
```

#### Permission Gate Component
```tsx
import { PermissionGate, PermissionAction } from '@/lib/rbac';

function Dashboard() {
  return (
    <div>
      <PermissionGate
        resourceName="analytics"
        action={PermissionAction.READ}
        fallback={<p>Access denied</p>}
      >
        <AnalyticsDashboard />
      </PermissionGate>
    </div>
  );
}
```

#### Team Member Gate
```tsx
import { TeamMemberGate } from '@/lib/rbac';

function AdminPanel() {
  return (
    <TeamMemberGate fallback={<Redirect to="/" />}>
      <AdminDashboard />
    </TeamMemberGate>
  );
}
```

#### Event Manager Gate
```tsx
import { EventManagerGate } from '@/lib/rbac';

function EventSettings({ eventId }) {
  return (
    <EventManagerGate
      eventId={eventId}
      fallback={<AccessDenied />}
    >
      <EventSettingsForm eventId={eventId} />
    </EventManagerGate>
  );
}
```

### SQL Queries

#### Check Permission via RPC
```sql
SELECT has_permission(
  'user-uuid',
  'events',
  'create',
  '{}'::jsonb
);
```

#### Get User Roles
```sql
SELECT 
  member_role,
  team_role,
  is_team_member
FROM user_profiles
WHERE id = 'user-uuid';
```

#### Get Event Team
```sql
SELECT 
  u.display_name,
  eta.team_role,
  eta.department,
  eta.responsibilities
FROM event_team_assignments eta
JOIN user_profiles u ON eta.user_id = u.id
WHERE eta.event_id = 'event-uuid'
  AND eta.removed_at IS NULL;
```

---

## Migration Guide

### Running Migrations

1. **Run migrations in order:**
```bash
# 1. Core RBAC schema
psql -f supabase/migrations/00021_enterprise_rbac_rls_system.sql

# 2. Functions and policies
psql -f supabase/migrations/00022_rbac_functions_and_policies.sql

# 3. Seed data
psql -f supabase/migrations/00023_rbac_seed_data.sql
```

2. **Verify installation:**
```sql
-- Check if types exist
SELECT typname FROM pg_type 
WHERE typname IN ('member_role', 'team_role', 'permission_scope', 'permission_action');

-- Check if tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'rbac_%';

-- Check if functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('has_permission', 'is_team_member', 'can_manage_event');
```

### Migrating Existing Users

```sql
-- Set default member role for existing users
UPDATE user_profiles
SET member_role = 'guest'
WHERE member_role IS NULL;

-- Promote existing admins to super_admin
UPDATE user_profiles
SET team_role = 'super_admin',
    is_team_member = true
WHERE email IN ('admin@gvteway.com'); -- Replace with actual admin emails

-- Set platform owner (Legend)
UPDATE user_profiles
SET team_role = 'legend',
    is_team_member = true
WHERE email = 'owner@gvteway.com'; -- Replace with owner email
```

---

## Security Best Practices

### 1. Principle of Least Privilege
- Always assign the minimum role required for the task
- Use user permission overrides for temporary elevated access
- Set expiration dates on temporary permissions

### 2. Regular Audits
```sql
-- Review audit log regularly
SELECT * FROM rbac_audit_log
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Check for unusual permission grants
SELECT * FROM rbac_user_permissions
WHERE granted = true
  AND expires_at IS NULL
  AND created_at > NOW() - INTERVAL '30 days';
```

### 3. Team Assignment Management
- Always specify `assigned_by` when creating team assignments
- Use `removed_at` instead of deleting assignments (audit trail)
- Review team assignments quarterly

### 4. Department Structure
- Keep department hierarchy shallow (max 3 levels)
- Assign department leads appropriately
- Use department-scoped permissions when possible

### 5. Permission Overrides
- Always provide a `reason` for permission overrides
- Set `expires_at` for temporary access
- Review and clean up expired overrides monthly

### 6. RLS Policy Testing
```sql
-- Test as different users
SET LOCAL role = 'authenticated';
SET LOCAL request.jwt.claims = '{"sub": "user-uuid"}';

-- Verify user can only see their own data
SELECT * FROM orders;
```

---

## Troubleshooting

### Common Issues

#### User Cannot Access Resource
1. Check user's roles:
```sql
SELECT member_role, team_role, is_team_member
FROM user_profiles WHERE id = 'user-uuid';
```

2. Check role permissions:
```sql
SELECT * FROM rbac_role_permissions
WHERE role_name = 'admin' AND role_type = 'team';
```

3. Check user permission overrides:
```sql
SELECT * FROM rbac_user_permissions
WHERE user_id = 'user-uuid' AND granted = false;
```

#### RLS Policy Not Working
1. Verify RLS is enabled:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'events';
```

2. Check policy definitions:
```sql
SELECT * FROM pg_policies
WHERE tablename = 'events';
```

3. Test function directly:
```sql
SELECT has_permission('user-uuid', 'events', 'read', '{}'::jsonb);
```

---

## API Reference

See `/src/lib/rbac/` for complete TypeScript API documentation:

- `types.ts` - Type definitions and enums
- `permissions.ts` - Permission checking utilities
- `hooks.ts` - React hooks for permission checking
- `components.tsx` - React components for permission gates
- `index.ts` - Main exports

---

## Event-Specific Roles

In addition to the core RBAC system, GVTEWAY implements **event-specific roles** for contextual access control. These roles provide:

- **9 Event Role Types** - Event Lead, Event Staff, Vendor, Talent, Agent, Sponsor, Media, Investor, Stakeholder
- **Event-Scoped Access** - Permissions only apply to specific events
- **Time-Bound Assignments** - Start and end dates for temporary access
- **Customizable Permissions** - Override defaults per assignment
- **3 Access Levels** - Standard, Elevated, Restricted

**See:** `/docs/EVENT_SPECIFIC_ROLES_GUIDE.md` for complete documentation

### Quick Example

```typescript
import { assignEventRole, EventRoleType } from '@/lib/rbac';

// Assign vendor to event
await assignEventRole(
  eventId,
  userId,
  EventRoleType.VENDOR,
  assignedByUserId,
  {
    department: 'Catering',
    accessStartDate: '2025-01-15T00:00:00Z',
    accessEndDate: '2025-01-16T23:59:59Z'
  }
);
```

---

## Support

For questions or issues with the RBAC system:
- Email: support@gvteway.com
- Documentation: 
  - Core RBAC: `/docs/RBAC_IMPLEMENTATION_GUIDE.md`
  - Event Roles: `/docs/EVENT_SPECIFIC_ROLES_GUIDE.md`
- Database Schema: 
  - Core: `/supabase/migrations/00021_*.sql`
  - Event Roles: `/supabase/migrations/00024_event_specific_roles.sql`

---

**Last Updated:** January 2025  
**Version:** 1.1.0  
**Status:** Production Ready ✅
