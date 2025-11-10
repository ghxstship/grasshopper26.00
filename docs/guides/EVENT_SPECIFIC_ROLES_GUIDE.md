## Event-Specific Roles Guide

**GVTEWAY Platform - Contextual Role Assignments**  
**Implementation Date:** January 2025  
**Status:** ✅ Complete

---

## 📋 Overview

Event-specific roles provide contextual access control for users who need limited permissions for individual events. Unlike global team roles, these roles are:

- **Event-Scoped** - Access only applies to specific events
- **Time-Bound** - Can have start and end dates
- **Customizable** - Permissions can be overridden per assignment
- **Flexible** - Users can have different roles across different events

---

## 🎭 Event Role Types

### 1. Event Lead
**Base Role:** `lead`  
**Badge:** 🛡️ Purple (#8B5CF6)  
**Access Level:** Full  
**Credential Type:** Management

**Digital Permissions:**
- ✅ Assign staff
- ✅ Approve changes
- ✅ View/edit schedule
- ✅ View financials
- ✅ View attendees
- ✅ Manage content
- ✅ Scan tickets
- ✅ Check-in guests
- ✅ View analytics
- ✅ Export reports
- ✅ Manage team
- ✅ Issue credentials
- ✅ Revoke access

**Physical Access:**
- ✅ All event areas
- ✅ Production office
- ✅ Security office
- ✅ Staff areas
- ✅ Backstage (limited)
- ✅ VIP areas (limited)

**Credential Features:**
- Badge number format: LEAD-XXXX
- Photo ID required
- Radio access (if applicable)
- Master key access
- 24/7 validity during event period

**Use Case:** Lead coordinator responsible for overall event execution

**Typical Holders:**
- Event director
- Production manager
- Operations manager
- Venue manager

---

### 2. Event Staff
**Base Role:** `team`  
**Badge:** ✓ Green (#10B981)  
**Access Level:** Standard  
**Credential Type:** Operations

**Digital Permissions:**
- ✅ Check-in guests
- ✅ Validate tickets
- ✅ Scan tickets
- ✅ View schedule
- ✅ View capacity
- ✅ Handle will-call
- ✅ View assigned areas
- ✅ Report incidents

**Physical Access:**
- ✅ Public areas
- ✅ Staff break areas
- ✅ Check-in stations
- ✅ Will-call booth
- ✅ Assigned work zones
- ❌ Backstage
- ❌ Production areas
- ❌ VIP areas

**Credential Features:**
- Badge number format: STAFF-XXXX
- Photo ID required
- Shift-based validity
- Radio access (if assigned)
- Position-specific access zones

**Use Case:** On-site staff handling operations and guest services

**Typical Holders:**
- Security personnel
- Ushers
- Box office staff
- Guest services
- Parking attendants

---

### 3. Vendor
**Base Role:** `collaborator`  
**Badge:** 💼 Orange (#F59E0B)  
**Access Level:** Standard  
**Credential Type:** Service Provider

**Digital Permissions:**
- ✅ View schedule
- ✅ Upload assets
- ✅ View vendor info
- ✅ Manage own content
- ✅ View load-in times
- ✅ View assigned booth/area
- ✅ Submit invoices
- ✅ View vendor agreement

**Physical Access:**
- ✅ Assigned vendor area
- ✅ Loading dock (during load-in/out)
- ✅ Vendor catering
- ✅ Vendor parking
- ✅ Public restrooms
- ❌ Backstage
- ❌ Production areas
- ❌ VIP areas

**Credential Features:**
- Badge number format: VEND-XXXX
- Company name displayed
- Time-restricted (load-in to load-out)
- Vehicle pass included
- Insurance verification required

**Use Case:** Event vendors (catering, AV, production, etc.)

**Typical Holders:**
- Catering companies
- Merchandise vendors
- Service providers
- Equipment rental companies

---

### 4. Talent
**Base Role:** `collaborator`  
**Badge:** 🎵 Pink (#EC4899)  
**Access Level:** Elevated  
**Credential Type:** Performer

**Digital Permissions:**
- ✅ View schedule
- ✅ View rider
- ✅ Upload media
- ✅ View set time
- ✅ View stage info
- ✅ Manage own content
- ✅ View hospitality
- ✅ Request technical changes
- ✅ View sound check times

**Physical Access:**
- ✅ Assigned dressing room
- ✅ Stage access (during set time)
- ✅ Artist catering
- ✅ Artist parking
- ✅ Green room (if applicable)
- ✅ Photo area (scheduled)
- ⚠️ Backstage (limited)
- ❌ Production areas
- ❌ Other dressing rooms

**Credential Features:**
- Badge number format: TLNT-XXXX
- Artist name prominently displayed
- Set time printed on badge
- Guest list allocation included
- Photo ID required

**Use Case:** Performing artists and entertainers

**Typical Holders:**
- Musicians
- DJs
- Comedians
- Performers
- Band members

---

### 5. Agent
**Base Role:** `collaborator`  
**Badge:** 👔 Indigo (#6366F1)  
**Access Level:** Elevated  
**Credential Type:** Management

**Digital Permissions:**
- ✅ View schedule
- ✅ View contracts
- ✅ View rider
- ✅ View payment schedule
- ✅ Communicate with production
- ✅ Represent artist interests
- ✅ Approve technical changes
- ✅ View settlement details

**Physical Access:**
- ✅ Artist dressing rooms (represented artists)
- ✅ Backstage (limited)
- ✅ Production office (scheduled)
- ✅ Artist catering
- ✅ Artist parking
- ⚠️ Stage access (limited)
- ❌ Technical areas
- ❌ Other artist areas

**Credential Features:**
- Badge number format: AGNT-XXXX
- Agency name displayed
- Represented artist(s) listed
- Business hours validity
- Professional designation

**Use Case:** Talent agents and representatives

**Typical Holders:**
- Booking agents
- Tour managers
- Artist managers
- Business representatives

---

### 6. Sponsor
**Base Role:** `partner`  
**Badge:** 🏆 Blue (#3B82F6)  
**Access Level:** Standard  
**Credential Type:** Partner

**Digital Permissions:**
- ✅ View analytics
- ✅ View demographics
- ✅ View attendees
- ✅ View engagement
- ✅ Export reports
- ✅ View brand exposure
- ✅ Upload activation photos
- ✅ View sponsorship deliverables

**Physical Access:**
- ✅ Sponsor activation area
- ✅ VIP hospitality (if included)
- ✅ Sponsor lounge
- ✅ Premium parking
- ✅ Public areas
- ⚠️ Backstage (VIP package only)
- ❌ Production areas
- ❌ Technical areas

**Credential Features:**
- Badge number format: SPON-XXXX
- Company logo displayed
- Sponsorship tier indicated
- Guest allocation included
- VIP designation (if applicable)

**Use Case:** Event sponsors tracking ROI and engagement

**Typical Holders:**
- Corporate sponsors
- Brand representatives
- Marketing teams
- Activation staff

---

### 7. Media
**Base Role:** `partner`  
**Badge:** 📷 Red (#EF4444)  
**Access Level:** Standard  
**Credential Type:** Press

**Digital Permissions:**
- ✅ View schedule
- ✅ Download media
- ✅ Upload content
- ✅ View press kit
- ✅ Access media area
- ✅ Request interviews
- ✅ View photo pit schedule
- ✅ Submit credentials for approval

**Physical Access:**
- ✅ Press area
- ✅ Photo pit (scheduled)
- ✅ Media lounge
- ✅ Interview area
- ✅ Press parking
- ⚠️ Backstage (escorted only)
- ❌ Dressing rooms
- ❌ Production areas

**Credential Features:**
- Badge number format: MEDIA-XXXX
- Outlet name displayed
- Photo/video designation
- Press credentials verified
- Equipment list attached

**Use Case:** Press, photographers, and media personnel

**Typical Holders:**
- Journalists
- Photographers
- Videographers
- Bloggers
- Content creators

---

### 8. Investor
**Base Role:** `partner`  
**Badge:** 📈 Emerald (#059669)  
**Access Level:** Elevated  
**Credential Type:** Financial

**Digital Permissions:**
- ✅ View financials
- ✅ View analytics
- ✅ Export reports
- ✅ View revenue
- ✅ View expenses
- ✅ View projections
- ✅ View ROI
- ✅ Access financial dashboard
- ✅ View settlement reports

**Physical Access:**
- ✅ VIP hospitality
- ✅ Production office (scheduled)
- ✅ Premium parking
- ✅ Investor lounge
- ⚠️ Backstage (limited)
- ❌ Stage areas
- ❌ Technical areas
- ❌ Dressing rooms

**Credential Features:**
- Badge number format: INVST-XXXX
- Investment entity displayed
- Financial access level indicated
- NDA acknowledgment required
- Executive designation

**Use Case:** Financial investors requiring reporting access

**Typical Holders:**
- Financial backers
- Investment partners
- Board members
- Financial advisors

---

### 9. Executive
**Base Role:** `executive`  
**Badge:** 💼 Navy (#1E3A8A)  
**Access Level:** Full  
**Credential Type:** Executive

**Digital Permissions:**
- ✅ View all reports
- ✅ Generate custom reports
- ✅ View comprehensive analytics
- ✅ View event status
- ✅ View financial summaries
- ✅ Export all data
- ✅ View strategic metrics
- ✅ Access executive dashboard

**Physical Access:**
- ✅ All public areas
- ✅ VIP hospitality
- ✅ Executive lounge
- ✅ Premium parking
- ✅ All backstage areas (AAA access)
- ✅ Production areas (AAA access)
- ✅ All restricted zones (AAA access)
- ✅ Green room
- ✅ Artist areas

**Credential Features:**
- Badge number format: EXEC-XXXX
- Organization/Title displayed
- Executive designation
- AAA physical access level
- Full event period validity
- VIP amenities included

**Use Case:** C-level executives and senior leadership with full access and reporting capabilities

**Typical Holders:**
- CEOs and Presidents
- Board members
- Senior executives
- Company owners
- Strategic partners
- Major stakeholders

---

### 10. AAA Credential
**Base Role:** `aaa`  
**Badge:** 🔴 Red (#EF4444)  
**Access Level:** Full

**Permissions:**
- ✅ All backstage areas
- ✅ All production areas
- ✅ All VIP areas
- ✅ Stage access
- ✅ All dressing rooms
- ✅ Premium catering
- ✅ Premium parking
- ✅ Unlimited guest list
- ✅ Photo pit access
- ✅ Soundboard access
- ✅ Green room access

**Use Case:** Highest level all-access credential for headliners, tour managers, and key production staff

**Typical Holders:**
- Headlining artists
- Tour managers
- Production directors
- Festival directors
- VIP guests (artist +1s)

---

### 11. AA Credential
**Base Role:** `aa`  
**Badge:** 🟡 Yellow (#F59E0B)  
**Access Level:** Elevated

**Permissions:**
- ✅ Backstage areas
- ✅ Production areas
- ✅ Stage access
- ✅ Assigned dressing rooms only
- ✅ Standard catering
- ✅ Standard parking
- ✅ Limited guest list
- ❌ VIP areas (restricted)
- ❌ Photo pit
- ❌ Soundboard access
- ❌ Green room

**Use Case:** High-level access for supporting artists, management, and essential production crew

**Typical Holders:**
- Supporting artists
- Artist management
- Essential production crew
- Stage managers
- Technical directors

---

### 12. Production Crew
**Base Role:** `production`  
**Badge:** 🔵 Blue (#3B82F6)  
**Access Level:** Elevated

**Permissions:**
- ✅ Backstage areas
- ✅ All production areas
- ✅ Stage access
- ✅ Equipment zones
- ✅ Loading dock
- ✅ Technical areas
- ✅ Soundboard access
- ✅ Standard catering
- ✅ Crew parking
- ❌ Dressing rooms
- ❌ VIP areas
- ❌ Guest list
- ❌ Green room

**Use Case:** Production and technical crew with access to stage, technical areas, and equipment zones

**Typical Holders:**
- Audio engineers
- Lighting technicians
- Stage hands
- Video crew
- Riggers
- Backline technicians
- Monitor engineers

---

## 🔧 Implementation

### Database Migration

```bash
# Run the event-specific roles migration
psql -f supabase/migrations/00024_event_specific_roles.sql
```

### TypeScript Usage

#### Assign Event Role

```typescript
import { assignEventRole, EventRoleType, EventAccessLevel } from '@/lib/rbac';

// Assign vendor to event
await assignEventRole(
  eventId,
  userId,
  EventRoleType.VENDOR,
  assignedByUserId,
  {
    department: 'Catering',
    responsibilities: ['Food service', 'Bar setup'],
    accessLevel: EventAccessLevel.STANDARD,
    specificPermissions: {
      can_view_schedule: true,
      can_upload_assets: true
    },
    accessStartDate: '2025-01-15T00:00:00Z',
    accessEndDate: '2025-01-16T23:59:59Z',
    notes: 'Main catering vendor',
    contactInfo: {
      phone: '+1234567890',
      emergency_contact: 'John Doe'
    }
  }
);
```

#### Check Event Permission

```typescript
import { hasEventPermission } from '@/lib/rbac';

const canScanTickets = await hasEventPermission(
  userId,
  eventId,
  'can_scan_tickets'
);

if (canScanTickets) {
  // Show ticket scanning interface
}
```

#### Get All Event Permissions

```typescript
import { getUserEventPermissions } from '@/lib/rbac';

const permissions = await getUserEventPermissions(userId, eventId);

console.log(permissions);
// {
//   can_view_schedule: true,
//   can_scan_tickets: true,
//   can_view_financials: false,
//   ...
// }
```

### React Hooks

#### Check Event Permission

```tsx
import { useEventPermission } from '@/lib/rbac';

function TicketScanner({ eventId }) {
  const { hasAccess, loading } = useEventPermission(
    eventId,
    'can_scan_tickets'
  );

  if (loading) return <Spinner />;
  if (!hasAccess) return <AccessDenied />;

  return <TicketScannerInterface />;
}
```

#### Get Event Role

```tsx
import { useEventRole, EVENT_ROLE_DISPLAY } from '@/lib/rbac';

function EventRoleBadge({ eventId }) {
  const { eventRole, loading } = useEventRole(eventId);

  if (loading || !eventRole) return null;

  return (
    <Badge>
      {EVENT_ROLE_DISPLAY[eventRole]}
    </Badge>
  );
}
```

#### Check Multiple Permissions

```tsx
import { useMultipleEventPermissions } from '@/lib/rbac';

function EventDashboard({ eventId }) {
  const { permissions, loading } = useMultipleEventPermissions(
    eventId,
    ['can_view_analytics', 'can_view_financials', 'can_export_reports']
  );

  if (loading) return <Spinner />;

  return (
    <div>
      {permissions.can_view_analytics && <AnalyticsSection />}
      {permissions.can_view_financials && <FinancialsSection />}
      {permissions.can_export_reports && <ExportButton />}
    </div>
  );
}
```

### Permission Gate Components

#### Event Permission Gate

```tsx
import { EventPermissionGate } from '@/lib/rbac';

function EventSettings({ eventId }) {
  return (
    <EventPermissionGate
      eventId={eventId}
      permissionKey="can_view_financials"
      fallback={<p>You don't have access to financials</p>}
    >
      <FinancialReports />
    </EventPermissionGate>
  );
}
```

#### Event Role Gate

```tsx
import { EventRoleGate, EventRoleType } from '@/lib/rbac';

function VendorPortal({ eventId }) {
  return (
    <EventRoleGate
      eventId={eventId}
      allowedRoles={[EventRoleType.VENDOR]}
      fallback={<Redirect to="/" />}
    >
      <VendorDashboard />
    </EventRoleGate>
  );
}
```

#### Specific Role Gates

```tsx
import { 
  EventLeadGate, 
  EventStaffGate, 
  EventTalentGate 
} from '@/lib/rbac';

function EventManagement({ eventId }) {
  return (
    <div>
      {/* Only event leads can see this */}
      <EventLeadGate eventId={eventId}>
        <TeamManagement />
      </EventLeadGate>

      {/* Event staff and leads can see this */}
      <EventStaffGate eventId={eventId}>
        <CheckInInterface />
      </EventStaffGate>

      {/* Talent and agents can see this */}
      <EventTalentGate eventId={eventId}>
        <PerformerInfo />
      </EventTalentGate>
    </div>
  );
}
```

---

## 🎯 Access Levels

### Standard Access
Default access level with permissions as defined in role definition.

```typescript
accessLevel: EventAccessLevel.STANDARD
```

### Elevated Access
Enhanced access with additional permissions beyond role defaults.

```typescript
accessLevel: EventAccessLevel.ELEVATED,
specificPermissions: {
  can_view_financials: true, // Override default
  can_export_reports: true
}
```

### Restricted Access
Limited access requiring explicit permission grants.

```typescript
accessLevel: EventAccessLevel.RESTRICTED,
specificPermissions: {
  can_view_schedule: true, // Only this is allowed
  can_upload_assets: false // Explicitly denied
}
```

---

## 📊 Permission Matrix

| Permission Key | Event Lead | Staff | Vendor | Talent | Agent | Sponsor | Media | Investor | Stakeholder |
|----------------|------------|-------|--------|--------|-------|---------|-------|----------|-------------|
| `can_view_schedule` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| `can_edit_schedule` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `can_scan_tickets` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `can_check_in` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `can_view_financials` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `can_view_attendees` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `can_view_analytics` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| `can_manage_content` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `can_upload_assets` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `can_export_reports` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| `can_manage_team` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🔐 Security Features

### Time-Bound Access
```typescript
// Access only valid during event dates
accessStartDate: '2025-01-15T00:00:00Z',
accessEndDate: '2025-01-16T23:59:59Z'
```

### Permission Auditing
```typescript
import { logEventPermissionUsage } from '@/lib/rbac';

// Log when permission is used
await logEventPermissionUsage(
  userId,
  eventId,
  'can_view_financials',
  'viewed',
  'financial_report',
  reportId
);
```

### RLS Enforcement
All event role assignments are protected by Row-Level Security policies that automatically scope access to the assigned event.

---

## 📈 Analytics & Reporting

### View Permission Usage

```sql
SELECT 
  u.display_name,
  erd.display_name as role,
  erpu.permission_key,
  erpu.action_type,
  COUNT(*) as usage_count
FROM event_role_permission_usage erpu
JOIN event_team_assignments eta ON erpu.assignment_id = eta.id
JOIN user_profiles u ON eta.user_id = u.id
JOIN event_role_definitions erd ON eta.event_role_type = erd.role_type
WHERE eta.event_id = 'event-uuid'
  AND erpu.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.display_name, erd.display_name, erpu.permission_key, erpu.action_type
ORDER BY usage_count DESC;
```

### View Active Event Team

```sql
SELECT 
  u.display_name,
  u.email,
  erd.display_name as role,
  eta.department,
  eta.access_level,
  eta.assigned_at
FROM event_team_assignments eta
JOIN user_profiles u ON eta.user_id = u.id
JOIN event_role_definitions erd ON eta.event_role_type = erd.role_type
WHERE eta.event_id = 'event-uuid'
  AND eta.removed_at IS NULL
  AND (eta.access_start_date IS NULL OR eta.access_start_date <= NOW())
  AND (eta.access_end_date IS NULL OR eta.access_end_date > NOW())
ORDER BY erd.role_type, u.display_name;
```

---

## 🚀 Best Practices

### 1. Use Appropriate Role Types
- Assign the most specific role that matches the user's function
- Don't use Event Lead for users who only need operational access

### 2. Set Time Bounds
- Always set `access_end_date` for temporary assignments
- Use `access_start_date` for pre-event setup access

### 3. Document Assignments
- Use the `notes` field to explain why access was granted
- Include contact information in `contact_info`

### 4. Review Regularly
- Audit event team assignments before each event
- Remove assignments after event completion

### 5. Use Access Levels Wisely
- Start with `STANDARD` access
- Only use `ELEVATED` when necessary
- Use `RESTRICTED` for high-security scenarios

### 6. Log Important Actions
- Log permission usage for financial and sensitive operations
- Review logs for unusual activity

---

## 🔄 Migration from Old System

If you have existing event team assignments without event role types:

```sql
-- Update existing assignments to use event role types
UPDATE event_team_assignments
SET event_role_type = CASE
  WHEN team_role = 'lead' THEN 'event_lead'::event_role_type
  WHEN team_role = 'team' THEN 'event_staff'::event_role_type
  WHEN team_role = 'collaborator' THEN 'vendor'::event_role_type
  WHEN team_role = 'partner' THEN 'stakeholder'::event_role_type
  ELSE NULL
END
WHERE event_role_type IS NULL
  AND removed_at IS NULL;
```

---

## 📞 Support

For questions or issues with event-specific roles:
- Email: support@gvteway.com
- Documentation: `/docs/EVENT_SPECIFIC_ROLES_GUIDE.md`
- Database Schema: `/supabase/migrations/00024_event_specific_roles.sql`

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
