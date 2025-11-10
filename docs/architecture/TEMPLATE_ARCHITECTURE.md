# Template Architecture & Selection Guide

## Overview

GVTEWAY uses a structured template system to ensure consistent layouts, design system compliance, and maintainable code across all pages. This document outlines the template hierarchy, when to use each template, and how to migrate custom layouts.

## Template Hierarchy

### 1. **ContextualPageTemplate** (Universal Flexible Template)
**Location:** `src/design-system/components/templates/shared/ContextualPageTemplate.tsx`

**Purpose:** Universal template for pages requiring custom layouts while maintaining structural consistency.

**When to Use:**
- Pages with unique layout requirements not covered by specialized templates
- Multi-section pages with complex content organization
- Pages requiring split-pane or grid-sidebar layouts
- Event management pages (credentials, check-in, artists)
- Admin detail pages with custom workflows
- Report generation interfaces

**Key Features:**
- ✅ Flexible layout options: `full-width`, `centered`, `sidebar-right`, `sidebar-left`, `split-pane`, `grid-sidebar`
- ✅ Breadcrumb navigation
- ✅ Status badges and metadata panels
- ✅ Primary/secondary actions
- ✅ Tab-based content organization
- ✅ Split-pane layouts with configurable ratios (50-50, 60-40, 40-60, 70-30)
- ✅ Grid layouts with sidebar (2, 3, or 4 columns)
- ✅ Content zones for complex multi-area layouts
- ✅ Loading and error states
- ✅ Fully design-system compliant (CSS Modules + design tokens)

**Layout Options:**

```typescript
// Full-width layout
<ContextualPageTemplate layout="full-width" title="Page Title">
  {/* Content */}
</ContextualPageTemplate>

// Sidebar layouts
<ContextualPageTemplate 
  layout="sidebar-right" 
  sidebar={<SidebarContent />}
>
  {/* Main content */}
</ContextualPageTemplate>

// Split-pane layout (side-by-side content)
<ContextualPageTemplate 
  layout="split-pane"
  splitRatio="60-40"
  leftPane={<LeftContent />}
  rightPane={<RightContent />}
>
</ContextualPageTemplate>

// Grid with sidebar (for card/item grids)
<ContextualPageTemplate 
  layout="grid-sidebar"
  gridColumns={3}
  gridGap="lg"
  sidebar={<FiltersSidebar />}
>
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</ContextualPageTemplate>

// Content zones (multiple distinct areas)
<ContextualPageTemplate
  contentZones={[
    { id: 'stats', content: <StatsPanel /> },
    { id: 'main', content: <MainContent /> },
    { id: 'activity', content: <ActivityFeed /> }
  ]}
>
</ContextualPageTemplate>
```

---

### 2. **PublicBrowseTemplate** (Public Catalog Pages)
**Location:** `src/design-system/components/templates/public/PublicBrowseTemplate.tsx`

**When to Use:**
- Public-facing browse/catalog pages
- Artist listings, event listings, shop pages
- Any page with search, filters, and grid of items

**Key Features:**
- Hero header with gradient option
- Search and filter controls
- Sort dropdown
- Configurable grid layouts (2, 3, or 4 columns)
- Empty states
- Loading skeletons
- Results count

---

### 3. **AdminDetailTemplate** (Admin Detail/Edit Pages)
**Location:** `src/design-system/components/templates/admin/AdminDetailTemplate.tsx`

**When to Use:**
- Admin detail pages (event details, user details, etc.)
- Admin edit forms
- Pages with tabs and metadata sidebar

**Key Features:**
- Breadcrumbs and back button
- Status badges
- Primary/secondary actions
- Tab-based content
- Metadata sidebar
- Loading states

**Note:** For admin pages with highly custom layouts (like event artists management, credentials dashboard), consider **ContextualPageTemplate** instead.

---

### 4. **AdminListTemplate** (Admin List Pages)
**Location:** `src/design-system/components/templates/admin/AdminListTemplate.tsx`

**When to Use:**
- Admin list/table pages
- User management, order lists, etc.

---

### 5. **AdminDashboardTemplate** (Admin Dashboards)
**Location:** `src/design-system/components/templates/admin/AdminDashboardTemplate.tsx`

**When to Use:**
- Admin dashboard pages with stats and KPIs

---

### 6. **AuthCardTemplate** (Authentication Pages)
**Location:** `src/design-system/components/templates/auth/AuthCardTemplate.tsx`

**When to Use:**
- Login, signup, password reset pages

---

### 7. **LegalPageTemplate** (Legal/Static Content)
**Location:** `src/design-system/components/templates/public/LegalPageTemplate.tsx`

**When to Use:**
- Terms of service, privacy policy, cookies policy

---

## Template Selection Decision Tree

```
START
  │
  ├─ Is it a public browse/catalog page? → PublicBrowseTemplate
  │
  ├─ Is it an authentication page? → AuthCardTemplate
  │
  ├─ Is it a legal/static content page? → LegalPageTemplate
  │
  ├─ Is it an admin page?
  │   │
  │   ├─ Simple list/table? → AdminListTemplate
  │   │
  │   ├─ Dashboard with stats? → AdminDashboardTemplate
  │   │
  │   ├─ Detail page with standard tabs/metadata? → AdminDetailTemplate
  │   │
  │   └─ Complex custom layout (split-pane, multi-section, unique workflow)?
  │       → ContextualPageTemplate
  │
  └─ Custom/unique layout requirements? → ContextualPageTemplate
```

---

## Migration Guide: Custom Pages → ContextualPageTemplate

### Pages That Should Use ContextualPageTemplate

Based on codebase audit, these pages have custom layouts and should migrate:

#### **High Priority (Complex Custom Layouts):**
1. `/admin/events/[id]/artists` - Split-pane layout (assigned vs available artists)
2. `/admin/events/[id]/credentials` - Multi-section dashboard
3. `/admin/events/[id]/check-in` - Real-time check-in interface
4. `/admin/events/[id]/schedule` - Timeline/schedule builder
5. `/admin/reports` - Report generation grid

#### **Medium Priority (Could Benefit):**
6. `/admin/events/[id]/tickets` - Ticket type management
7. `/admin/events/[id]/vendors` - Vendor assignment
8. `/admin/events/[id]/team` - Team member management
9. `/admin/bulk-operations` - Bulk action interface

---

## Migration Examples

### Example 1: Event Artists Page (Split-Pane Layout)

**Before (Custom CSS Modules):**
```tsx
// page.tsx
<main className={styles.container}>
  <section className={styles.headerBorder}>
    <div className={styles.headerContainer}>
      <Link href={`/admin/events/${id}`} className={styles.backLink}>
        <ArrowLeft /> Back to Event
      </Link>
      <h1 className={styles.title}>Event Artists</h1>
    </div>
  </section>
  
  <section className={styles.mainSection}>
    <div className={styles.grid}>
      <div>{/* Assigned Artists */}</div>
      <div>{/* Available Artists */}</div>
    </div>
  </section>
</main>
```

**After (ContextualPageTemplate):**
```tsx
import { ContextualPageTemplate } from '@/design-system/components/templates';

<ContextualPageTemplate
  breadcrumbs={[
    { label: 'Events', href: '/admin/events' },
    { label: event?.name || '', href: `/admin/events/${id}` },
    { label: 'Artists', href: `/admin/events/${id}/artists` }
  ]}
  title="Event Artists"
  subtitle={`${event?.name} - Manage artist lineup and billing`}
  layout="split-pane"
  splitRatio="50-50"
  leftPane={
    <Card>
      <CardHeader>
        <CardTitle>Assigned Artists ({assignedArtists.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Assigned artists list */}
      </CardContent>
    </Card>
  }
  rightPane={
    <Card>
      <CardHeader>
        <CardTitle>Available Artists</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Available artists list */}
      </CardContent>
    </Card>
  }
/>
```

**Benefits:**
- ✅ Eliminates 200+ lines of custom CSS
- ✅ Automatic breadcrumb navigation
- ✅ Consistent header styling
- ✅ Responsive split-pane layout
- ✅ Design system compliance

---

### Example 2: Event Credentials Dashboard (Content Zones)

**Before:**
```tsx
<main className={styles.container}>
  <header className={styles.header}>
    {/* Custom header */}
  </header>
  
  <section className={styles.stats}>
    {/* Stats cards */}
  </section>
  
  <section className={styles.filters}>
    {/* Filters */}
  </section>
  
  <section className={styles.credentialsList}>
    {/* Credentials table */}
  </section>
</main>
```

**After:**
```tsx
<ContextualPageTemplate
  breadcrumbs={[
    { label: 'Events', href: '/admin/events' },
    { label: event?.name || '', href: `/admin/events/${id}` },
    { label: 'Credentials', href: `/admin/events/${id}/credentials` }
  ]}
  title="Event Credentials"
  subtitle="Manage event access credentials and badges"
  primaryAction={{
    label: 'Issue New Credential',
    href: `/admin/events/${id}/credentials/issue`,
    icon: <Plus />
  }}
  metadata={[
    { label: 'Total Issued', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Checked In', value: stats.checkedIn }
  ]}
  contentZones={[
    {
      id: 'filters',
      content: <CredentialFilters />
    },
    {
      id: 'list',
      content: <CredentialsTable credentials={filteredCredentials} />
    }
  ]}
/>
```

---

### Example 3: Reports Page (Grid-Sidebar Layout)

**Before:**
```tsx
<div className={styles.container}>
  <header className={styles.header}>
    <h1>Reports</h1>
  </header>
  
  <div className={styles.grid}>
    {reports.map(report => (
      <ReportCard key={report.id} {...report} />
    ))}
  </div>
</div>
```

**After:**
```tsx
<ContextualPageTemplate
  title="Reports & Analytics"
  subtitle="Generate comprehensive reports for your events"
  layout="grid-sidebar"
  gridColumns={3}
  gridGap="lg"
  sidebar={
    <Card>
      <CardHeader>
        <CardTitle>Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </CardContent>
    </Card>
  }
>
  {reports.map(report => (
    <ReportCard key={report.id} {...report} />
  ))}
</ContextualPageTemplate>
```

---

## Design System Compliance Checklist

When using ContextualPageTemplate (or any template):

- ✅ **NO Tailwind utility classes** in component code
- ✅ **NO hardcoded colors** - use `var(--color-*)` tokens
- ✅ **NO directional properties** - use logical properties
- ✅ **CSS Modules REQUIRED** for custom styling
- ✅ **Design tokens MANDATORY** for spacing, colors, typography

---

## Best Practices

### 1. **Choose the Right Layout**
- Use `full-width` for simple single-column content
- Use `centered` for focused content (max-width 1200px)
- Use `sidebar-right` for metadata/filters
- Use `split-pane` for side-by-side comparisons or workflows
- Use `grid-sidebar` for item grids with filters
- Use `contentZones` for complex multi-section layouts

### 2. **Leverage Built-in Features**
- Use `breadcrumbs` for navigation context
- Use `statusBadge` for status indicators
- Use `metadata` for key-value pairs
- Use `tabs` for content organization
- Use `primaryAction` and `secondaryActions` for CTAs

### 3. **Keep Content Modular**
- Extract complex sections into separate components
- Pass components as `children`, `leftPane`, `rightPane`, or `contentZones`
- Maintain single responsibility principle

### 4. **Responsive Design**
- All layouts automatically stack on mobile
- Sidebars move below content on small screens
- Split-panes become single column
- Grids collapse to single column

---

## Template Exports

All templates are exported from the design system index:

```typescript
import {
  ContextualPageTemplate,
  PublicBrowseTemplate,
  AdminDetailTemplate,
  AdminListTemplate,
  AdminDashboardTemplate,
  AuthCardTemplate,
  LegalPageTemplate,
} from '@/design-system/components/templates';
```

---

## Future Enhancements

Potential additions to ContextualPageTemplate:

1. **Timeline Layout** - For schedule/event timeline views
2. **Kanban Layout** - For task boards
3. **Wizard Layout** - For multi-step forms
4. **Comparison Layout** - For side-by-side comparisons with sync scroll

---

## Questions?

For template selection guidance or migration assistance, refer to:
- Design system documentation: `/docs/architecture/DESIGN_SYSTEM_COMPLIANCE_REMEDIATION.md`
- Zero tolerance compliance: `/docs/ZERO_TOLERANCE_COMPLETE.md`
