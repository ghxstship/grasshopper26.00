# RBAC System Documentation

**GVTEWAY Platform - Complete Access Control System**

---

## 📚 Documentation Index

### Core RBAC System
**[RBAC Implementation Guide](../RBAC_IMPLEMENTATION_GUIDE.md)**
- Global role hierarchy (Member & Team roles)
- Permission system architecture
- Database schema and functions
- TypeScript utilities and React hooks
- Security best practices

### Event-Specific Roles
**[Event-Specific Roles Guide](../EVENT_SPECIFIC_ROLES_GUIDE.md)**
- 9 event role types (Event Lead, Staff, Vendor, Talent, etc.)
- Contextual, time-bound access control
- Permission customization
- Usage examples and best practices

**[Implementation Summary](../EVENT_ROLES_IMPLEMENTATION_SUMMARY.md)**
- Quick deployment guide
- File structure overview
- Integration examples
- Security considerations

---

## 🚀 Quick Start

### 1. Run Migrations

```bash
# Core RBAC system
psql -f supabase/migrations/00021_enterprise_rbac_rls_system.sql
psql -f supabase/migrations/00022_rbac_functions_and_policies.sql
psql -f supabase/migrations/00023_rbac_seed_data.sql

# Event-specific roles
psql -f supabase/migrations/00024_event_specific_roles.sql
```

### 2. Set Platform Owner

```sql
-- Set your user as Legend (platform owner)
UPDATE user_profiles
SET team_role = 'legend',
    is_team_member = true
WHERE email = 'your-email@gvteway.com';
```

### 3. Import in Code

```typescript
import {
  // Core RBAC
  hasPermission,
  isTeamMember,
  canManageEvent,
  usePermission,
  PermissionGate,
  TeamRole,
  MemberRole,
  
  // Event Roles
  assignEventRole,
  hasEventPermission,
  useEventPermission,
  EventPermissionGate,
  EventRoleType
} from '@/lib/rbac';
```

---

## 🎭 Role Types

### Member Roles (Customer-Facing)
- **Guest** - Unauthenticated/invited guest
- **Attendee** - Ticketed event access
- **Trial Member** - Limited trial access
- **Member** - Full subscribed member

### Team Roles (Internal/Staff)
- **Legend** - Platform owner (god mode)
- **Super Admin** - Organization-level admin
- **Admin** - Event-level admin
- **Lead** - Department-level lead
- **Team** - Event-level team member
- **Collaborator** - Limited access
- **Partner** - Read-only stakeholder
- **Ambassador** - Brand ambassador

### Event Roles (Event-Scoped)
- **Event Lead** - Event coordinator
- **Event Staff** - On-site operations
- **Vendor** - Event vendors
- **Talent** - Performing artists
- **Agent** - Talent representatives
- **Sponsor** - Event sponsors
- **Media** - Press/media
- **Investor** - Financial investors
- **Stakeholder** - General stakeholders

---

## 💡 Common Use Cases

### Check Global Permission

```typescript
const canCreateEvent = await hasPermission(
  userId,
  'events',
  PermissionAction.CREATE
);
```

### Check Event Permission

```typescript
const canScanTickets = await hasEventPermission(
  userId,
  eventId,
  'can_scan_tickets'
);
```

### Assign Event Role

```typescript
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

### Use Permission Gate

```tsx
<PermissionGate
  resourceName="events"
  action={PermissionAction.UPDATE}
  fallback={<AccessDenied />}
>
  <EventEditor />
</PermissionGate>
```

### Use Event Permission Gate

```tsx
<EventPermissionGate
  eventId={eventId}
  permissionKey="can_scan_tickets"
  fallback={<AccessDenied />}
>
  <TicketScanner />
</EventPermissionGate>
```

---

## 🔐 Security Features

✅ **Row-Level Security (RLS)** - Database-enforced access control  
✅ **Granular Permissions** - Fine-grained resource access  
✅ **Audit Logging** - Complete permission change trail  
✅ **Time-Bound Access** - Automatic expiration handling  
✅ **Permission Overrides** - User-specific grants/revokes  
✅ **Event Scoping** - Contextual access per event  
✅ **Access Levels** - Standard, elevated, restricted  

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    RBAC System                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │ Member Roles │         │  Team Roles  │            │
│  │  (Customer)  │         │  (Internal)  │            │
│  └──────────────┘         └──────────────┘            │
│         │                        │                     │
│         └────────┬───────────────┘                     │
│                  │                                     │
│         ┌────────▼────────┐                           │
│         │   Permissions   │                           │
│         │    (Global)     │                           │
│         └────────┬────────┘                           │
│                  │                                     │
│         ┌────────▼────────┐                           │
│         │   Event Roles   │                           │
│         │ (Event-Scoped)  │                           │
│         └────────┬────────┘                           │
│                  │                                     │
│         ┌────────▼────────┐                           │
│         │  RLS Policies   │                           │
│         │  (Enforcement)  │                           │
│         └─────────────────┘                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Development

### TypeScript Files
- `src/lib/rbac/types.ts` - Type definitions
- `src/lib/rbac/permissions.ts` - Permission utilities
- `src/lib/rbac/hooks.ts` - React hooks
- `src/lib/rbac/components.tsx` - Permission gates
- `src/lib/rbac/event-roles.ts` - Event role utilities
- `src/lib/rbac/event-role-hooks.ts` - Event role hooks
- `src/lib/rbac/event-role-components.tsx` - Event role gates

### Database Files
- `supabase/migrations/00021_enterprise_rbac_rls_system.sql`
- `supabase/migrations/00022_rbac_functions_and_policies.sql`
- `supabase/migrations/00023_rbac_seed_data.sql`
- `supabase/migrations/00024_event_specific_roles.sql`

---

## 📞 Support

- **Email**: support@gvteway.com
- **Core RBAC**: `/docs/RBAC_IMPLEMENTATION_GUIDE.md`
- **Event Roles**: `/docs/EVENT_SPECIFIC_ROLES_GUIDE.md`
- **Summary**: `/docs/EVENT_ROLES_IMPLEMENTATION_SUMMARY.md`

---

**Version:** 1.1.0  
**Status:** Production Ready ✅  
**Last Updated:** January 2025
