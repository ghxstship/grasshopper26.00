# Normalized Route Structure

## Overview

All user role dashboards now follow a consistent, scalable pattern:

```
/{role}           → Root page (redirects to dashboard)
/{role}/dashboard → Main dashboard with overview/stats
/{role}/*         → Feature-specific pages
```

## Route Structure by Role

### 1. Legend (Platform Admin)
**Base:** `/legend`

```
/legend                    → Redirects to /legend/dashboard
/legend/dashboard          → Platform overview with global stats
/legend/organizations      → Manage all organizations
/legend/venues             → Manage all venues
/legend/vendors            → Manage all vendors
/legend/staff              → Manage platform staff
```

**Access:** Platform admins only (`is_platform_admin = true`)

---

### 2. Organization (Org Admin)
**Base:** `/organization`

```
/organization              → Redirects to /organization/dashboard
/organization/dashboard    → Organization overview with KPIs
/organization/events       → Event management
/organization/orders       → Order management
/organization/products     → Product catalog
/organization/users        → User management
/organization/inventory    → Inventory management
/organization/advances     → Advance management
/organization/roles        → Role & permissions
... (43 total pages)
```

**Access:** Organization admins (`brand_team_assignments.team_role IN ('super_admin', 'admin')`)

---

### 3. Team (Event Staff)
**Base:** `/team`

```
/team                      → Redirects to /team/dashboard
/team/dashboard            → Event staff dashboard with live metrics
/team/scanner              → QR code ticket scanner
/team/issues               → Issue reporting system
/team/notes                → Real-time team notes
```

**Access:** Event staff (`event_team_assignments.event_role_type IN ('event_lead', 'event_staff')`)

---

### 4. Member (Members)
**Base:** `/member`

```
/member                    → Redirects to /member/dashboard
/member/dashboard          → Member portal with personal stats
/member/portal/*           → Legacy portal routes (to be migrated)
/member/orders             → Order history
/member/credits            → Credit balance
/member/favorites          → Saved items
/member/referrals          → Referral program
```

**Access:** All authenticated users

---

## Middleware Routing

The middleware automatically routes users to their appropriate dashboard based on role:

```typescript
switch (role) {
  case 'platform_admin':
    url.pathname = '/legend/dashboard';
    break;
  case 'org_admin':
    url.pathname = '/organization/dashboard';
    break;
  case 'staff':
    url.pathname = '/team/dashboard';
    break;
  case 'member':
  default:
    url.pathname = '/member/dashboard';
    break;
}
```

## Benefits of This Structure

1. **Consistency**: All roles follow the same pattern
2. **Scalability**: Easy to add new roles or features
3. **Clarity**: URL structure clearly indicates user context
4. **Maintainability**: Predictable file organization
5. **SEO-friendly**: Clean, semantic URLs
6. **No Redirects**: Direct access to dashboards (except root → dashboard redirect)

## Migration Notes

### Completed
- ✅ Team routes restructured (removed redundant `/staff/` nesting)
- ✅ Organization dashboard moved to `/organization/dashboard`
- ✅ Member dashboard moved to `/member/dashboard`
- ✅ Legend dashboard created at `/legend/dashboard`
- ✅ Middleware updated to use new paths
- ✅ Root redirect pages created for all roles

### Pending
- ⏳ Move Legend routes from `(legend)` route group to `/legend/*`
- ⏳ Migrate `/member/portal/*` routes to `/member/*`
- ⏳ Update all internal links to use new paths
- ⏳ Update navigation components

## File Structure

```
src/app/
├── legend/
│   ├── page.tsx (redirect)
│   ├── dashboard/
│   │   └── page.tsx
│   └── [other-features]/
├── organization/
│   ├── page.tsx (redirect)
│   ├── dashboard/
│   │   └── page.tsx
│   └── [other-features]/
├── team/
│   ├── page.tsx (redirect)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── scanner/
│   ├── issues/
│   └── notes/
└── member/
    ├── page.tsx (redirect)
    ├── dashboard/
    │   └── page.tsx
    └── [other-features]/
```

## Testing

Run the test script to verify all routes:

```bash
./scripts/test-team-routes.sh
```

Expected: All routes return 200 or 307 (redirect), no 404 or 500 errors.
