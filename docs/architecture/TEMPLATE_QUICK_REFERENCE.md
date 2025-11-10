# Template Quick Reference

## ContextualPageTemplate - Layout Cheat Sheet

### Basic Usage

```tsx
import { ContextualPageTemplate } from '@/design-system/components/templates';

<ContextualPageTemplate
  title="Page Title"
  subtitle="Optional subtitle"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Current', href: '/current' }
  ]}
>
  {/* Your content */}
</ContextualPageTemplate>
```

---

## Layout Options

### 1. Full Width (Default)
```tsx
layout="full-width"
```
Single column, full container width.

### 2. Centered
```tsx
layout="centered"
```
Single column, max-width 1200px, centered.

### 3. Sidebar Right
```tsx
layout="sidebar-right"
sidebar={<YourSidebar />}
```
Main content left, 300px sidebar right.

### 4. Sidebar Left
```tsx
layout="sidebar-left"
sidebar={<YourSidebar />}
```
300px sidebar left, main content right.

### 5. Split Pane
```tsx
layout="split-pane"
splitRatio="60-40"  // or "50-50", "40-60", "70-30"
leftPane={<LeftContent />}
rightPane={<RightContent />}
```
Side-by-side content with configurable ratios.

### 6. Grid Sidebar
```tsx
layout="grid-sidebar"
gridColumns={3}  // or 2, 4
gridGap="lg"     // or "sm", "md"
sidebar={<FiltersSidebar />}
```
Multi-column grid with sidebar.

---

## Common Patterns

### With Actions
```tsx
primaryAction={{
  label: 'Create New',
  onClick: handleCreate,
  icon: <Plus />
}}
secondaryActions={[
  { label: 'Export', onClick: handleExport, icon: <Download /> }
]}
```

### With Status Badge
```tsx
statusBadge={{
  label: 'Active',
  variant: 'success'  // or 'warning', 'error', 'info'
}}
```

### With Metadata Panel
```tsx
metadata={[
  { label: 'Created', value: '2025-01-01' },
  { label: 'Status', value: <Badge>Active</Badge> },
  { icon: <Users />, label: 'Attendees', value: '1,234' }
]}
```

### With Tabs
```tsx
tabs={[
  { id: 'overview', label: 'Overview', content: <Overview /> },
  { id: 'details', label: 'Details', content: <Details />, badge: '5' }
]}
activeTab={currentTab}
onTabChange={setCurrentTab}
```

### With Content Zones
```tsx
contentZones={[
  { id: 'stats', content: <StatsPanel /> },
  { id: 'main', content: <MainContent /> },
  { id: 'activity', content: <ActivityFeed /> }
]}
```

---

## When to Use Each Layout

| Use Case | Layout | Props |
|----------|--------|-------|
| Simple page | `full-width` | - |
| Focused content | `centered` | - |
| Filters/metadata | `sidebar-right` | `sidebar` |
| Navigation tree | `sidebar-left` | `sidebar` |
| Comparison view | `split-pane` | `leftPane`, `rightPane`, `splitRatio` |
| Item grid + filters | `grid-sidebar` | `gridColumns`, `gridGap`, `sidebar` |
| Complex dashboard | `contentZones` | `contentZones` |

---

## Migration Checklist

Migrating from custom CSS to ContextualPageTemplate:

- [ ] Identify layout pattern (sidebar, split-pane, grid, etc.)
- [ ] Extract breadcrumbs to `breadcrumbs` prop
- [ ] Move title/subtitle to `title`/`subtitle` props
- [ ] Convert actions to `primaryAction`/`secondaryActions`
- [ ] Move metadata to `metadata` prop
- [ ] Organize content into appropriate layout props
- [ ] Remove custom CSS module
- [ ] Test responsive behavior
- [ ] Verify design system compliance

---

## Design System Compliance

ContextualPageTemplate enforces:

✅ CSS Modules only (no Tailwind utilities)  
✅ Design tokens for all values  
✅ Logical properties (no directional)  
✅ Consistent spacing and typography  
✅ Responsive breakpoints  
✅ Accessible markup  

---

## File Locations

**Template:** `src/design-system/components/templates/shared/ContextualPageTemplate.tsx`  
**Styles:** `src/design-system/components/templates/shared/ContextualPageTemplate.module.css`  
**Docs:** `docs/architecture/TEMPLATE_ARCHITECTURE.md`  
**Export:** `src/design-system/components/templates/index.ts`
