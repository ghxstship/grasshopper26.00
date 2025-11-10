# RBAC System Developer Guide
**GVTEWAY Platform - Role-Based Access Control**

## Quick Start

The GVTEWAY platform uses a comprehensive three-tier role system:
1. **Member Roles** - Customer-facing access (member, trial_member, attendee, guest)
2. **Team Roles** - Internal staff hierarchy (legend, super_admin, admin, lead, team, collaborator, partner, ambassador)
3. **Event Roles** - Event-scoped permissions (event_lead, event_staff, vendor, talent, agent, sponsor, media, investor, stakeholder)

---

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Database Functions](#database-functions)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## Basic Usage

### Check User Permission (Frontend)

```tsx
import { usePermission } from '@/lib/rbac';

function MyComponent() {
  const { hasAccess, loading } = usePermission('events', 'create');
  
  if (loading) return <LoadingSpinner />;
  if (!hasAccess) return <AccessDenied />;
  
  return <CreateEventButton />;
}
```

### Permission Gate Component

```tsx
import { PermissionGate } from '@/lib/rbac';

function MyComponent() {
  return (
    <PermissionGate 
      resourceName="events" 
      action="create"
      fallback={<p>You don't have permission to create events.</p>}
    >
      <CreateEventForm />
    </PermissionGate>
  );
}
```

### Check Event-Specific Permission

```tsx
import { useEventPermission } from '@/lib/rbac';

function EventDashboard({ eventId }: { eventId: string }) {
  const { hasAccess } = useEventPermission(eventId, 'can_view_financials');
  
  return (
    <div>
      {hasAccess && <FinancialReport eventId={eventId} />}
    </div>
  );
}
```

---

## Frontend Implementation

### Available Hooks

#### Core RBAC Hooks
```tsx
import {
  usePermission,        // Check specific permission
  useIsTeamMember,      // Check if user is team member
  useIsSuperAdmin,      // Check if user is super admin
  useCanManageEvent,    // Check if user can manage event
  useCanManageBrand     // Check if user can manage brand
} from '@/lib/rbac';
```

#### Event Role Hooks
```tsx
import {
  useEventRole,              // Get user's event role
  useHasEventAssignment,     // Check if user has event assignment
  useEventPermission,        // Check event permission
  useEventPermissions,       // Get all event permissions
  useEventRoleDefinition,    // Get role definition
  useUserEventRoleInfo       // Get comprehensive role info
} from '@/lib/rbac';
```

### Available Components

#### Permission Gates
```tsx
import {
  PermissionGate,      // Generic permission check
  TeamMemberGate,      // Team member only
  SuperAdminGate,      // Super admin only
  EventManagerGate,    // Event manager only
  BrandManagerGate     // Brand manager only
} from '@/lib/rbac';
```

#### Event Role Gates
```tsx
import {
  EventPermissionGate,  // Event permission check
  EventAssignmentGate,  // Has event assignment
  EventRoleGate,        // Specific event role(s)
  EventLeadGate,        // Event lead only
  EventStaffGate,       // Event staff/lead
  EventVendorGate,      // Vendor only
  EventTalentGate,      // Talent/agent only
  EventSponsorGate,     // Sponsor only
  EventMediaGate        // Media only
} from '@/lib/rbac';
```

### Example: Multi-Level Access Control

```tsx
import { SuperAdminGate, EventLeadGate } from '@/lib/rbac';

function EventSettings({ eventId }: { eventId: string }) {
  return (
    <div>
      {/* Super admins can always access */}
      <SuperAdminGate>
        <DangerZone />
      </SuperAdminGate>
      
      {/* Event leads can access their events */}
      <EventLeadGate eventId={eventId}>
        <EventConfiguration />
      </EventLeadGate>
    </div>
  );
}
```

---

## Backend Implementation

### API Route Protection

```typescript
import { requireAuth, requireAdmin } from '@/lib/api/middleware';

export async function POST(req: NextRequest) {
  // Require authentication
  const user = await requireAuth(req);
  
  // Your logic here
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  // Require admin role
  await requireAdmin(req);
  
  // Your logic here
  return NextResponse.json({ success: true });
}
```

### Permission Service

```typescript
import { PermissionsService } from '@/lib/services/permissions.service';

const permService = new PermissionsService();

// Check permission
const canCreate = await permService.hasPermission(userId, 'events', 'create');

// Check multiple permissions
const hasAny = await permService.hasAnyPermission(userId, [
  { resource: 'events', action: 'create' },
  { resource: 'events', action: 'update' }
]);

// Get user role
const role = await permService.getUserRole(userId);

// Check if admin
const isAdmin = await permService.isAdmin(userId);
```

### RBAC Functions

```typescript
import {
  hasPermission,
  isTeamMember,
  isSuperAdmin,
  canManageEvent,
  canManageBrand,
  getUserTeamRole,
  getUserMemberRole
} from '@/lib/rbac';

// Check permission with context
const canEdit = await hasPermission(
  userId,
  'events',
  'update',
  { event_id: eventId }
);

// Check team membership
const isTeam = await isTeamMember(userId);

// Check event management
const canManage = await canManageEvent(userId, eventId);
```

---

## Database Functions

### Core Permission Functions

```sql
-- Check if user has permission
SELECT has_permission(
  'user-id'::uuid,
  'events',
  'create'::permission_action,
  '{}'::jsonb
);

-- Check if user is team member
SELECT is_team_member('user-id'::uuid);

-- Check if user is super admin
SELECT is_super_admin('user-id'::uuid);

-- Check if user can manage event
SELECT can_manage_event('user-id'::uuid, 'event-id'::uuid);
```

### Event Role Functions

```sql
-- Get user's event role
SELECT get_user_event_role('user-id'::uuid, 'event-id'::uuid);

-- Check event permission
SELECT has_event_permission(
  'user-id'::uuid,
  'event-id'::uuid,
  'can_view_financials'
);

-- Get all event permissions
SELECT get_user_event_permissions('user-id'::uuid, 'event-id'::uuid);

-- Check if user has active assignment
SELECT has_active_event_assignment('user-id'::uuid, 'event-id'::uuid);
```

---

## Common Patterns

### Pattern 1: Admin-Only Feature

```tsx
// Frontend
import { SuperAdminGate } from '@/lib/rbac';

<SuperAdminGate fallback={<AccessDenied />}>
  <AdminPanel />
</SuperAdminGate>

// Backend
import { requireAdmin } from '@/lib/api/middleware';

export async function POST(req: NextRequest) {
  await requireAdmin(req);
  // Admin-only logic
}
```

### Pattern 2: Event-Scoped Access

```tsx
// Frontend
import { EventPermissionGate } from '@/lib/rbac';

<EventPermissionGate 
  eventId={eventId} 
  permissionKey="can_view_financials"
>
  <FinancialReport />
</EventPermissionGate>

// Backend
import { hasEventPermission } from '@/lib/rbac';

const canView = await hasEventPermission(userId, eventId, 'can_view_financials');
if (!canView) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Pattern 3: Role-Based UI

```tsx
import { useEventRole } from '@/lib/rbac';
import { EventRoleType } from '@/lib/rbac';

function EventDashboard({ eventId }: { eventId: string }) {
  const { eventRole, loading } = useEventRole(eventId);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {eventRole === EventRoleType.EVENT_LEAD && <LeadDashboard />}
      {eventRole === EventRoleType.EVENT_STAFF && <StaffDashboard />}
      {eventRole === EventRoleType.SPONSOR && <SponsorDashboard />}
    </div>
  );
}
```

### Pattern 4: Assign Event Role

```typescript
import { assignEventRole, EventRoleType, EventAccessLevel } from '@/lib/rbac';

// Assign user to event
await assignEventRole(
  eventId,
  userId,
  EventRoleType.EVENT_STAFF,
  assignedByUserId,
  {
    department: 'Operations',
    responsibilities: ['Check-in', 'Ticket scanning'],
    canManageTeam: false,
    accessLevel: EventAccessLevel.STANDARD,
    accessStartDate: '2025-01-01T00:00:00Z',
    accessEndDate: '2025-12-31T23:59:59Z',
    notes: 'On-site staff for event operations'
  }
);
```

### Pattern 5: Check Multiple Permissions

```tsx
import { useMultipleEventPermissions } from '@/lib/rbac';

function EventControls({ eventId }: { eventId: string }) {
  const { permissions, loading } = useMultipleEventPermissions(eventId, [
    'can_view_financials',
    'can_manage_content',
    'can_scan_tickets'
  ]);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {permissions.can_view_financials && <FinancialButton />}
      {permissions.can_manage_content && <ContentButton />}
      {permissions.can_scan_tickets && <ScanButton />}
    </div>
  );
}
```

---

## Troubleshooting

### Permission Not Working?

1. **Check RLS Policies**
   ```sql
   -- Verify policies are enabled
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE tablename = 'your_table';
   ```

2. **Check User Role Assignment**
   ```sql
   SELECT id, member_role, team_role, is_team_member
   FROM user_profiles
   WHERE id = 'user-id';
   ```

3. **Check Event Assignment**
   ```sql
   SELECT * FROM event_team_assignments
   WHERE user_id = 'user-id' AND event_id = 'event-id' AND removed_at IS NULL;
   ```

4. **Test Permission Function**
   ```sql
   SELECT has_permission(
     'user-id'::uuid,
     'resource-name',
     'action'::permission_action,
     '{}'::jsonb
   );
   ```

### Common Issues

**Issue:** User can't access even though they have the role
- **Solution:** Check if `is_team_member` is set to `true` in `user_profiles`

**Issue:** Event permission not working
- **Solution:** Verify event role assignment has not expired (check `access_end_date`)

**Issue:** Permission check returns false unexpectedly
- **Solution:** Check `rbac_user_permissions` for explicit denials (granted = false)

**Issue:** RLS policy blocking legitimate access
- **Solution:** Review policy conditions and ensure user context is correct

### Debug Mode

Enable permission debugging:

```typescript
// Add to your component
const { hasAccess, loading } = usePermission('events', 'create');

console.log('Permission Check:', {
  resource: 'events',
  action: 'create',
  hasAccess,
  loading
});
```

---

## Role Hierarchy

### Member Roles (Ascending Power)
1. `guest` - Invited guest, single event access
2. `attendee` - Ticketed event access
3. `trial_member` - Trial membership, limited features
4. `member` - Full membership access

### Team Roles (Ascending Power)
1. `ambassador` - Brand ambassador
2. `partner` - Read-only stakeholder
3. `collaborator` - Limited access team member
4. `team` - Event-level team member
5. `lead` - Department lead
6. `admin` - Event-level admin
7. `super_admin` - Organization admin
8. `legend` - Platform owner (god mode)

### Event Roles (By Function)
- **Operations:** `event_lead`, `event_staff`
- **Vendors:** `vendor`
- **Talent:** `talent`, `agent`
- **Business:** `sponsor`, `investor`, `stakeholder`
- **Media:** `media`

---

## Best Practices

1. **Always use permission gates in UI** - Never rely on hiding UI elements alone
2. **Protect API routes** - Use `requireAuth()` or `requireAdmin()` middleware
3. **Use event-scoped permissions** - For event-specific features, use event roles
4. **Provide fallback UI** - Always show users why they can't access something
5. **Log permission changes** - Audit trail is automatic via triggers
6. **Test permission boundaries** - Verify users can't escalate privileges
7. **Use TypeScript types** - Import enums for type safety
8. **Cache permission checks** - Hooks automatically cache, don't call repeatedly
9. **Handle loading states** - Always show loading UI during permission checks
10. **Document custom permissions** - Add comments for business-specific rules

---

## API Reference

### Types

```typescript
// Member Roles
enum MemberRole {
  MEMBER = 'member',
  TRIAL_MEMBER = 'trial_member',
  ATTENDEE = 'attendee',
  GUEST = 'guest'
}

// Team Roles
enum TeamRole {
  LEGEND = 'legend',
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  LEAD = 'lead',
  TEAM = 'team',
  COLLABORATOR = 'collaborator',
  PARTNER = 'partner',
  AMBASSADOR = 'ambassador'
}

// Event Roles
enum EventRoleType {
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

// Permission Actions
enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
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

---

## Additional Resources

- **Triple Audit Report:** `docs/ROLES_TRIPLE_AUDIT.md`
- **Database Schema:** `supabase/migrations/00021_enterprise_rbac_rls_system.sql`
- **Event Roles:** `supabase/migrations/00034_event_specific_roles.sql`
- **RBAC Functions:** `src/lib/rbac/`
- **Permission Service:** `src/lib/services/permissions.service.ts`

---

**Last Updated:** November 9, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
