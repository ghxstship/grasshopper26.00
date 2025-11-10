# Atomic Design Templates Strategy
## Leveraging Page Templates for Maximum Scalability

**Date:** November 9, 2025  
**Status:** Proposed  
**Impact:** High - Improved consistency, reduced duplication, faster development

## Executive Summary

Analysis of 47 pages across 4 route groups reveals **significant opportunities** to leverage the templates level of our atomic design system. By creating reusable page templates, we can:

- **Reduce code duplication** by 60-70% across similar pages
- **Ensure visual consistency** across all admin, portal, auth, and public pages
- **Accelerate development** with pre-built, compliant layouts
- **Enforce design system compliance** at the template level

## Current State Analysis

### Route Groups Identified
1. **Admin** (`/admin/*`) - 19 pages
2. **Portal** (`/(portal)/*`) - 10 pages  
3. **Auth** (`/(auth)/*`) - 6 pages
4. **Public** (`/(public)/*`) - 12 pages

### Common Patterns Found

#### 1. **Admin List Pages** (8 instances)
**Pattern:** Header + Stats + Filters/Search + Data Table/Grid + Actions

**Examples:**
- `/admin/advances/page.tsx` - Production advances queue
- `/admin/artists/page.tsx` - Artist management
- `/admin/events/page.tsx` - Event management
- `/admin/credentials/page.tsx` - Credential management
- `/admin/brands/page.tsx` - Brand management

**Repeated Elements:**
```typescript
// Header with title, subtitle, action button
<div className={styles.header}>
  <h1>TITLE</h1>
  <p>Subtitle</p>
  <Button>Primary Action</Button>
</div>

// Stats grid (3-6 cards)
<div className={styles.grid}>
  <StatCard label="Metric 1" value={value1} />
  <StatCard label="Metric 2" value={value2} />
</div>

// Filter tabs
<div className={styles.tabs}>
  {tabs.map(tab => <TabButton />)}
</div>

// Search bar
<div className={styles.search}>
  <SearchIcon />
  <Input placeholder="Search..." />
  <Button>Search</Button>
</div>

// Data display (table or grid)
<div className={styles.tableContainer}>
  {loading ? <Loader /> : <DataTable />}
</div>
```

**Duplication:** ~70% of code is identical structure

#### 2. **Admin Detail Pages** (6 instances)
**Pattern:** Breadcrumbs + Header + Tabs + Form/Content + Actions

**Examples:**
- `/admin/advances/[id]/page.tsx`
- `/admin/events/[id]/page.tsx`
- `/admin/artists/[id]/page.tsx`

**Repeated Elements:**
- Breadcrumb navigation
- Page header with back button
- Status badges
- Tabbed content sections
- Action buttons (Save, Delete, etc.)

**Duplication:** ~60% of code is identical structure

#### 3. **Admin Dashboard Pages** (3 instances)
**Pattern:** Welcome Header + Stats Grid + Quick Actions + Tabbed Management

**Examples:**
- `/admin/dashboard/page.tsx`
- `/admin/analytics/page.tsx`

**Repeated Elements:**
- Welcome message with user context
- 6-card stats grid
- Tab-based content switching
- Quick action cards

**Duplication:** ~65% of code is identical structure

#### 4. **Portal Dashboard Pages** (2 instances)
**Pattern:** Personalized Header + Feature Grid + Content Sections

**Examples:**
- `/(portal)/portal/page.tsx` - Member dashboard
- `/(portal)/credits/page.tsx` - Credits dashboard

**Repeated Elements:**
- Personalized welcome header
- Membership status display
- Grid-based feature cards
- Sectioned content areas

**Duplication:** ~55% of code is identical structure

#### 5. **Auth Pages** (6 instances)
**Pattern:** Centered Card + Form + OAuth Options + Footer Links

**Examples:**
- `/(auth)/login/page.tsx`
- `/(auth)/signup/page.tsx`
- `/(auth)/forgot-password/page.tsx`
- `/(auth)/reset-password/page.tsx`

**Repeated Elements:**
```typescript
<div className={styles.container}>
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>
      <form>
        {/* Form fields */}
      </form>
      <div className={styles.divider}>Or continue with</div>
      <div className={styles.oauthButtons}>
        {/* OAuth buttons */}
      </div>
    </CardContent>
    <CardFooter>
      {/* Links */}
    </CardFooter>
  </Card>
</div>
```

**Duplication:** ~80% of code is identical structure

#### 6. **Public Browse Pages** (4 instances)
**Pattern:** Hero Header + Filters + Grid Display + Pagination

**Examples:**
- `/(public)/artists/page.tsx`
- `/(public)/events/page.tsx`
- `/(public)/shop/page.tsx`
- `/(public)/news/page.tsx`

**Repeated Elements:**
- Hero section with title and description
- Filter sidebar or top bar
- Grid-based content display
- Empty states
- Pagination controls

**Duplication:** ~60% of code is identical structure

## Proposed Template Architecture

### Template Hierarchy

```
design-system/components/templates/
├── admin/
│   ├── AdminListTemplate.tsx           # List/index pages
│   ├── AdminDetailTemplate.tsx         # Detail/edit pages
│   ├── AdminDashboardTemplate.tsx      # Dashboard pages
│   └── AdminFormTemplate.tsx           # Create/edit forms
├── portal/
│   ├── PortalDashboardTemplate.tsx     # Member dashboards
│   └── PortalContentTemplate.tsx       # Content pages
├── auth/
│   └── AuthCardTemplate.tsx            # All auth pages
├── public/
│   ├── PublicBrowseTemplate.tsx        # Browse/listing pages
│   ├── PublicDetailTemplate.tsx        # Detail pages
│   └── PublicLandingTemplate.tsx       # Landing/hero pages
└── shared/
    ├── ErrorTemplate.tsx               # Error pages
    └── LoadingTemplate.tsx             # Loading states
```

## Detailed Template Specifications

### 1. AdminListTemplate

**Purpose:** Standardize all admin list/index pages

**Props Interface:**
```typescript
interface AdminListTemplateProps {
  // Header
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  
  // Stats (optional)
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  
  // Filters
  tabs?: Array<{
    key: string;
    label: string;
    count?: number;
  }>;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  
  // Content
  loading?: boolean;
  empty?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
      label: string;
      href: string;
    };
  };
  children: React.ReactNode; // Table or Grid content
}
```

**Usage Example:**
```typescript
<AdminListTemplate
  title="PRODUCTION ADVANCES"
  subtitle="Manage and review production advance requests"
  primaryAction={{
    label: "Create Advance",
    href: "/admin/advances/create",
    icon: <Plus />
  }}
  stats={[
    { label: "Pending Review", value: stats.pending },
    { label: "Under Review", value: stats.underReview },
    { label: "Approved", value: stats.approved }
  ]}
  tabs={filterTabs}
  activeTab={filter}
  onTabChange={setFilter}
  searchPlaceholder="Search by advance number, event, company..."
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  onSearch={fetchAdvances}
  loading={loading}
  empty={{
    icon: <GeometricIcon name="clipboard" />,
    title: "No advances found",
    description: "No advances in the system"
  }}
>
  <AdvancesTable advances={advances} />
</AdminListTemplate>
```

**Benefits:**
- Eliminates ~200 lines of repeated code per page
- Ensures consistent header, stats, and filter layouts
- Built-in loading and empty states
- Design system compliant by default

### 2. AdminDetailTemplate

**Purpose:** Standardize admin detail/edit pages

**Props Interface:**
```typescript
interface AdminDetailTemplateProps {
  // Breadcrumbs
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
  
  // Header
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'error' | 'info';
  };
  
  // Actions
  backHref?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
    icon?: React.ReactNode;
    loading?: boolean;
  }>;
  
  // Tabs (optional)
  tabs?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  
  // Content
  loading?: boolean;
  children: React.ReactNode;
}
```

**Usage Example:**
```typescript
<AdminDetailTemplate
  breadcrumbs={[
    { label: "Advances", href: "/admin/advances" },
    { label: advance.advance_number }
  ]}
  title={advance.advance_number}
  subtitle={advance.event_name}
  status={{
    label: advance.status,
    variant: getStatusVariant(advance.status)
  }}
  backHref="/admin/advances"
  actions={[
    {
      label: "Approve",
      onClick: handleApprove,
      variant: "default",
      loading: approving
    },
    {
      label: "Reject",
      onClick: handleReject,
      variant: "destructive"
    }
  ]}
  tabs={[
    { key: "details", label: "Details", icon: <FileText /> },
    { key: "items", label: "Items", icon: <Package /> },
    { key: "history", label: "History", icon: <Clock /> }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  loading={loading}
>
  <AdvanceDetailsContent advance={advance} />
</AdminDetailTemplate>
```

### 3. AdminDashboardTemplate

**Purpose:** Standardize dashboard pages

**Props Interface:**
```typescript
interface AdminDashboardTemplateProps {
  // Header
  title: string;
  subtitle?: string;
  user?: {
    name: string;
    role?: string;
  };
  primaryAction?: {
    label: string;
    href: string;
  };
  
  // Stats Grid
  stats: Array<{
    title: string;
    value: string | number;
    meta?: string;
    icon: React.ReactNode;
    trend?: {
      value: number;
      direction: 'up' | 'down';
    };
  }>;
  
  // Management Tabs
  tabs: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
}
```

### 4. AuthCardTemplate

**Purpose:** Standardize all authentication pages

**Props Interface:**
```typescript
interface AuthCardTemplateProps {
  // Card Header
  title: string;
  description?: string;
  
  // Form
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitLoading?: boolean;
  children: React.ReactNode; // Form fields
  
  // OAuth (optional)
  showOAuth?: boolean;
  oauthProviders?: Array<'google' | 'github' | 'azure'>;
  onOAuthLogin?: (provider: string) => void;
  
  // Magic Link (optional)
  showMagicLink?: boolean;
  onMagicLink?: () => void;
  
  // Footer
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}
```

**Usage Example:**
```typescript
<AuthCardTemplate
  title="Welcome Back"
  description="Sign in to your account to continue"
  onSubmit={handleSubmit}
  submitLabel="Sign In"
  submitLoading={loading}
  showOAuth={true}
  oauthProviders={['google', 'github', 'azure']}
  onOAuthLogin={handleOAuthLogin}
  showMagicLink={true}
  onMagicLink={handleMagicLink}
  footerText="Don't have an account?"
  footerLink={{ text: "Sign up", href: "/signup" }}
>
  <div className={styles.formFields}>
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <Label htmlFor="password">Password</Label>
    <Input
      id="password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>
</AuthCardTemplate>
```

**Benefits:**
- Reduces auth page code by ~80%
- Consistent OAuth button styling
- Built-in dividers and spacing
- Responsive by default

### 5. PublicBrowseTemplate

**Purpose:** Standardize public browse/listing pages

**Props Interface:**
```typescript
interface PublicBrowseTemplateProps {
  // Hero Header
  title: string;
  description?: string;
  heroImage?: string;
  
  // Filters
  filters?: React.ReactNode;
  showFilters?: boolean;
  
  // Content
  loading?: boolean;
  empty?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      href: string;
    };
  };
  children: React.ReactNode; // Grid content
  
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}
```

## Implementation Plan

### Phase 1: Core Templates (Week 1)
**Priority: High**

1. **AuthCardTemplate** (Highest ROI - 80% reduction)
   - Migrate 6 auth pages
   - Estimated savings: ~1,200 lines of code

2. **AdminListTemplate** (High impact - 8 pages)
   - Migrate admin list pages
   - Estimated savings: ~1,600 lines of code

### Phase 2: Admin Templates (Week 2)
**Priority: High**

3. **AdminDetailTemplate**
   - Migrate 6 detail pages
   - Estimated savings: ~900 lines of code

4. **AdminDashboardTemplate**
   - Migrate dashboard pages
   - Estimated savings: ~400 lines of code

### Phase 3: Public & Portal Templates (Week 3)
**Priority: Medium**

5. **PublicBrowseTemplate**
   - Migrate 4 browse pages
   - Estimated savings: ~600 lines of code

6. **PortalDashboardTemplate**
   - Migrate portal pages
   - Estimated savings: ~400 lines of code

### Phase 4: Shared Templates (Week 4)
**Priority: Low**

7. **ErrorTemplate**
8. **LoadingTemplate**

## Expected Benefits

### Quantitative
- **Code Reduction:** ~5,100 lines of duplicate code eliminated
- **File Size:** Average page size reduced from ~250 lines to ~80 lines
- **Development Speed:** New pages created 3-4x faster
- **Maintenance:** Single source of truth for layouts

### Qualitative
- **Consistency:** 100% visual consistency across similar pages
- **Compliance:** Design system rules enforced at template level
- **Accessibility:** A11y patterns built into templates
- **Responsiveness:** Mobile-first responsive design by default
- **Testing:** Shared templates = shared test coverage

## Design System Compliance

All templates will enforce:

✅ **CSS Modules** - No inline styles, no Tailwind utilities  
✅ **Design Tokens** - All colors via `var(--color-*)`  
✅ **Logical Properties** - `margin-inline-start` not `margin-left`  
✅ **Geometric Design** - GHXSTSHIP hard edges, thick borders  
✅ **Atomic Composition** - Built from atoms → molecules → organisms

## Migration Strategy

### For Each Template:

1. **Create Template Component**
   - Build in `/design-system/components/templates/`
   - Include comprehensive CSS Module
   - Add TypeScript interfaces
   - Document props and usage

2. **Migrate First Page**
   - Choose simplest example
   - Refactor to use template
   - Verify functionality
   - Test responsive behavior

3. **Migrate Remaining Pages**
   - Apply template to similar pages
   - Adjust page-specific content
   - Remove duplicate code
   - Update imports

4. **Update Documentation**
   - Add to templates index
   - Create usage examples
   - Update component library

### Example Migration:

**Before** (`/admin/artists/page.tsx` - 192 lines):
```typescript
export default function AdminArtistsPage() {
  // 50 lines of state and handlers
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* 30 lines of header code */}
      </div>
      <Card className={styles.searchCard}>
        {/* 20 lines of search code */}
      </Card>
      {loading ? (
        {/* 15 lines of loading state */}
      ) : filteredArtists.length === 0 ? (
        {/* 15 lines of empty state */}
      ) : (
        <div className={styles.grid}>
          {/* 60 lines of grid code */}
        </div>
      )}
    </div>
  );
}
```

**After** (80 lines):
```typescript
export default function AdminArtistsPage() {
  // 50 lines of state and handlers (same)
  
  return (
    <AdminListTemplate
      title="Artist Management"
      subtitle="Manage artist profiles and information"
      primaryAction={{
        label: "Add Artist",
        href: "/admin/artists/create",
        icon: <Plus />
      }}
      searchPlaceholder="Search artists..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      loading={loading}
      empty={{
        icon: <Music />,
        title: "No artists found"
      }}
    >
      <ArtistsGrid artists={filteredArtists} onDelete={deleteArtist} />
    </AdminListTemplate>
  );
}
```

**Savings:** 112 lines (58% reduction)

## Success Metrics

### Code Quality
- [ ] 60%+ reduction in page component code
- [ ] 100% design system compliance in templates
- [ ] Zero Tailwind utility classes in templates
- [ ] All templates use CSS Modules

### Developer Experience
- [ ] New pages created in < 30 minutes
- [ ] Template documentation complete
- [ ] Storybook examples for all templates
- [ ] TypeScript strict mode compliance

### User Experience
- [ ] Consistent layouts across all pages
- [ ] Improved page load times (less code)
- [ ] Better mobile responsiveness
- [ ] Enhanced accessibility scores

## Next Steps

1. **Review & Approve** this strategy
2. **Create template components** (Phase 1)
3. **Migrate auth pages** (quick win)
4. **Migrate admin pages** (high impact)
5. **Document patterns** for team
6. **Update component library**

---

## Conclusion

Implementing page templates is a **high-impact, low-risk** improvement that will:

- **Dramatically reduce code duplication** (~5,100 lines)
- **Accelerate development** (3-4x faster page creation)
- **Ensure consistency** (single source of truth)
- **Enforce compliance** (design system rules built-in)

The templates level of atomic design is currently underutilized. By creating these 8-10 core templates, we can transform how pages are built while maintaining the flexibility needed for unique requirements.

**Recommendation:** Proceed with Phase 1 implementation immediately.
