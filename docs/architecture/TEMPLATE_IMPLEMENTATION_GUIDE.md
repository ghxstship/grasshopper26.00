# Page Template Implementation Guide

## Overview

This guide provides complete implementation instructions for all 8 page templates in the GVTEWAY design system. All templates are **100% design system compliant** with:
- ✅ CSS Modules only (no Tailwind utilities)
- ✅ Design tokens for all colors/spacing
- ✅ Logical properties (not directional)
- ✅ Consistent component usage
- ✅ Built-in accessibility patterns

---

## Template Catalog

### 1. PublicBrowseTemplate
**Location:** `/src/design-system/components/templates/public/PublicBrowseTemplate.tsx`

**Use Cases:** Events, Shop, Artists, News, Catalog browsing

**Features:**
- Hero header with gradient
- Search bar with icon
- Expandable filters
- Sort dropdown
- Responsive grid (2-4 columns)
- Loading skeletons
- Empty states
- Results count

**Example Usage:**
```tsx
import { PublicBrowseTemplate } from '@/design-system/components/templates';
import { EventCard } from '@/design-system/components/organisms';
import { Calendar } from 'lucide-react';

export default function EventsPage() {
  const { events, loading, searchQuery, setSearchQuery, sortBy, setSortBy } = useEvents();
  
  return (
    <PublicBrowseTemplate
      title="DISCOVER EVENTS"
      subtitle="Find your next unforgettable experience"
      heroGradient={true}
      
      // Search
      searchPlaceholder="Search events, venues..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      
      // Sort
      sortOptions={[
        { value: 'date-asc', label: 'Date (Earliest First)' },
        { value: 'date-desc', label: 'Date (Latest First)' },
        { value: 'price-asc', label: 'Price (Low to High)' },
      ]}
      sortValue={sortBy}
      onSortChange={setSortBy}
      
      // Content
      items={events}
      renderItem={(event) => <EventCard event={event} />}
      gridColumns={3}
      gap="lg"
      
      // Empty State
      emptyState={{
        icon: <Calendar />,
        title: "No events found",
        description: "Try adjusting your search or filters",
        action: {
          label: "Clear Filters",
          onClick: () => clearFilters()
        }
      }}
      
      loading={loading}
      loadingCount={6}
    />
  );
}
```

---

### 2. PortalDashboardTemplate
**Location:** `/src/design-system/components/templates/portal/PortalDashboardTemplate.tsx`

**Use Cases:** Portal home, Credits, Referrals, Vouchers

**Features:**
- Personalized greeting
- Primary hero card
- Stats grid
- Multiple content sections
- Empty states with CTAs
- Two-column layout option

**Example Usage:**
```tsx
import { PortalDashboardTemplate } from '@/design-system/components/templates';
import { MembershipCard, QuickStats } from '@/design-system/components/organisms';
import { Ticket, DollarSign } from 'lucide-react';

export default function PortalPage() {
  const { user, membership, stats } = usePortalData();
  
  return (
    <PortalDashboardTemplate
      greeting={`Welcome Back, ${user.name}`}
      userInfo={
        <span>{membership.tier} Member • Since {membership.year}</span>
      }
      
      // Hero Section
      primaryCard={<MembershipCard membership={membership} />}
      statsCards={[
        {
          label: "Ticket Credits",
          value: stats.credits,
          icon: <Ticket />,
          trend: { value: 12, direction: 'up', label: 'this month' }
        },
        {
          label: "Total Spent",
          value: `$${stats.totalSpent}`,
          icon: <DollarSign />,
        }
      ]}
      
      // Content Sections
      sections={[
        {
          id: 'upcoming',
          title: 'Your Upcoming Events',
          content: <UpcomingEvents />,
          isEmpty: upcomingEvents.length === 0,
          emptyState: {
            title: "No upcoming events",
            description: "Browse events to find your next experience",
            action: {
              label: "Browse Events",
              onClick: () => router.push('/events')
            }
          }
        },
        {
          id: 'benefits',
          title: 'Available Benefits',
          content: <AvailableBenefits membership={membership} />
        }
      ]}
      
      layout="single-column"
      loading={loading}
    />
  );
}
```

---

### 3. AdminDetailTemplate
**Location:** `/src/design-system/components/templates/admin/AdminDetailTemplate.tsx`

**Use Cases:** Event details, Artist details, Brand details (admin)

**Features:**
- Breadcrumb navigation
- Status badges
- Action buttons
- Tabbed interface
- Metadata sidebar
- Loading states

**Example Usage:**
```tsx
import { AdminDetailTemplate } from '@/design-system/components/templates';
import { Edit, Trash2, Calendar } from 'lucide-react';

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { event, loading } = useEvent(params.id);
  
  return (
    <AdminDetailTemplate
      // Navigation
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Events', href: '/admin/events' },
        { label: event.name, href: `/admin/events/${event.id}` }
      ]}
      backHref="/admin/events"
      
      // Header
      title={event.name}
      subtitle={event.venue_name}
      statusBadge={{
        label: event.status,
        variant: event.status === 'published' ? 'success' : 'warning'
      }}
      
      // Actions
      primaryAction={{
        label: "Edit Event",
        href: `/admin/events/${event.id}/edit`,
        icon: <Edit />
      }}
      secondaryActions={[
        {
          label: "Delete",
          onClick: () => handleDelete(),
          icon: <Trash2 />,
          variant: 'destructive'
        }
      ]}
      
      // Tabs
      tabs={[
        {
          key: 'details',
          label: 'Details',
          icon: <Calendar />,
          content: <EventDetailsTab event={event} />
        },
        {
          key: 'tickets',
          label: 'Tickets',
          badge: event.ticketsSold,
          content: <EventTicketsTab event={event} />
        }
      ]}
      
      // Metadata Sidebar
      metadata={[
        { label: 'Created', value: formatDate(event.created_at) },
        { label: 'Event ID', value: event.id },
        { label: 'Capacity', value: event.capacity }
      ]}
      
      loading={loading}
    />
  );
}
```

---

### 4. CheckoutFlowTemplate
**Location:** `/src/design-system/components/templates/checkout/CheckoutFlowTemplate.tsx`

**Use Cases:** Advances checkout, Shop checkout, Ticket purchase

**Features:**
- Step progress indicator
- Sticky order summary
- Navigation buttons
- Form validation states
- Mobile-responsive

**Example Usage:**
```tsx
import { CheckoutFlowTemplate } from '@/design-system/components/templates';
import { OrderSummary } from '@/design-system/components/organisms';

export default function CheckoutPage() {
  const { currentStep, steps, cart, handleNext, handleBack } = useCheckout();
  
  return (
    <CheckoutFlowTemplate
      // Progress
      steps={[
        { key: 'cart', label: 'Review Cart', completed: currentStep > 0 },
        { key: 'shipping', label: 'Shipping', completed: currentStep > 1 },
        { key: 'payment', label: 'Payment', completed: currentStep > 2 },
        { key: 'confirm', label: 'Confirm', completed: false }
      ]}
      currentStep={currentStep}
      
      // Content
      stepContent={<CheckoutStepContent step={currentStep} />}
      
      // Summary
      orderSummary={<OrderSummary cart={cart} />}
      
      // Navigation
      onNext={handleNext}
      onBack={handleBack}
      onCancel={() => router.push('/shop')}
      nextLabel={currentStep === 3 ? 'Place Order' : 'Continue'}
      nextDisabled={!isStepValid(currentStep)}
      nextLoading={isProcessing}
    />
  );
}
```

---

### 5. OrderHistoryTemplate
**Location:** `/src/design-system/components/templates/portal/OrderHistoryTemplate.tsx`

**Use Cases:** Orders, Advances history, Purchase history

**Features:**
- Status filter tabs
- Date range filter
- Order cards
- Loading skeletons
- Empty states

**Example Usage:**
```tsx
import { OrderHistoryTemplate } from '@/design-system/components/templates';
import { OrderCard } from '@/design-system/components/organisms';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const { orders, loading, statusFilter, setStatusFilter } = useOrders();
  
  return (
    <OrderHistoryTemplate
      title="Order History"
      subtitle="View all your past and current orders"
      
      // Filters
      statusFilters={[
        { key: 'all', label: 'All Orders', count: orders.length },
        { key: 'completed', label: 'Completed', count: completedCount },
        { key: 'pending', label: 'Pending', count: pendingCount }
      ]}
      activeFilter={statusFilter}
      onFilterChange={setStatusFilter}
      
      // Orders
      orders={filteredOrders}
      renderOrder={(order) => <OrderCard order={order} />}
      
      // Empty State
      emptyState={{
        icon: <Package />,
        title: "No Orders Yet",
        description: "You haven't placed any orders yet. Start exploring!",
        action: {
          label: "Browse Events",
          href: "/events"
        }
      }}
      
      loading={loading}
      loadingCount={3}
    />
  );
}
```

---

### 6. AdminDashboardTemplate
**Location:** `/src/design-system/components/templates/admin/AdminDashboardTemplate.tsx`

**Use Cases:** Admin dashboard, Analytics overview

**Features:**
- Stats grid with trends
- Quick action cards
- Tabbed content
- Icon-based stats
- Responsive layout

**Example Usage:**
```tsx
import { AdminDashboardTemplate } from '@/design-system/components/templates';
import { Calendar, Users, Ticket, DollarSign, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const { stats, loading } = useAdminStats();
  
  return (
    <AdminDashboardTemplate
      title="Admin Dashboard"
      subtitle="Manage your events, artists, and sales"
      
      primaryAction={{
        label: "Create Event",
        href: "/admin/events/new",
        icon: <Plus />
      }}
      
      // Stats
      stats={[
        {
          label: "Total Events",
          value: stats.totalEvents,
          icon: <Calendar />,
          meta: `${stats.upcomingEvents} upcoming`,
          trend: { value: 12, direction: 'up' }
        },
        {
          label: "Tickets Sold",
          value: stats.ticketsSold,
          icon: <Ticket />,
          meta: "Active tickets"
        },
        {
          label: "Total Revenue",
          value: `$${stats.revenue.toLocaleString()}`,
          icon: <DollarSign />,
          meta: `From ${stats.orders} orders`
        }
      ]}
      
      // Quick Actions
      quickActions={[
        {
          label: "Create Event",
          description: "Add a new event to the platform",
          icon: <Calendar />,
          onClick: () => router.push('/admin/events/new')
        },
        {
          label: "Add Artist",
          description: "Register a new artist",
          icon: <Users />,
          onClick: () => router.push('/admin/artists/new')
        }
      ]}
      
      // Tabs
      tabs={[
        {
          key: 'events',
          label: 'Recent Events',
          icon: <Calendar />,
          content: <RecentEventsTable />
        },
        {
          key: 'orders',
          label: 'Recent Orders',
          content: <RecentOrdersTable />
        }
      ]}
      
      loading={loading}
    />
  );
}
```

---

### 7. DetailViewTemplate
**Location:** `/src/design-system/components/templates/public/DetailViewTemplate.tsx`

**Use Cases:** Event details, Artist details, News articles, Product details

**Features:**
- Hero image
- Breadcrumbs
- Share button
- Sidebar support
- Related items carousel
- SEO-friendly

**Example Usage:**
```tsx
import { DetailViewTemplate } from '@/design-system/components/templates';
import { Calendar, MapPin, Ticket } from 'lucide-react';

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const { event, relatedEvents } = useEvent(params.slug);
  
  return (
    <DetailViewTemplate
      // Hero
      heroImage={event.hero_image_url}
      heroImageAlt={event.name}
      title={event.name}
      subtitle={event.venue_name}
      metadata={
        <>
          <span><Calendar /> {formatDate(event.start_date)}</span>
          <span><MapPin /> {event.venue_address}</span>
        </>
      }
      
      // Navigation
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Events', href: '/events' },
        { label: event.name, href: `/events/${event.slug}` }
      ]}
      backHref="/events"
      
      // Actions
      primaryAction={{
        label: "Get Tickets",
        href: `/events/${event.slug}/tickets`,
        icon: <Ticket />
      }}
      secondaryActions={[
        {
          label: "Add to Calendar",
          onClick: () => addToCalendar(event)
        }
      ]}
      showShareButton={true}
      
      // Sidebar
      sidebar={<EventSidebar event={event} />}
      showSidebar={true}
      
      // Related Items
      relatedItems={{
        title: "Similar Events",
        items: relatedEvents.map(e => ({
          id: e.id,
          title: e.name,
          image: e.hero_image_url,
          href: `/events/${e.slug}`
        }))
      }}
      
      contentWidth="wide"
    >
      <EventDescription event={event} />
      <EventLineup event={event} />
      <EventVenueMap event={event} />
    </DetailViewTemplate>
  );
}
```

---

### 8. LegalPageTemplate
**Location:** `/src/design-system/components/templates/public/LegalPageTemplate.tsx`

**Use Cases:** Privacy Policy, Terms of Service, Cookie Policy, About

**Features:**
- Auto-generated table of contents
- Sticky sidebar navigation
- Print-friendly
- Prose styling
- Active section tracking

**Example Usage:**
```tsx
import { LegalPageTemplate } from '@/design-system/components/templates';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageTemplate
      title="Privacy Policy"
      lastUpdated="2025-01-10"
      showTableOfContents={true}
      backHref="/"
      backLabel="Back to Home"
    >
      <h2 id="introduction">Introduction</h2>
      <p>
        GVTEWAY ("we", "our", or "us") is committed to protecting your privacy...
      </p>

      <h2 id="information-collection">Information We Collect</h2>
      <h3 id="personal-information">Personal Information</h3>
      <p>We collect the following personal information...</p>

      <h3 id="usage-data">Usage Data</h3>
      <p>We automatically collect certain information...</p>

      <h2 id="data-usage">How We Use Your Data</h2>
      <p>We use your information for the following purposes...</p>
    </LegalPageTemplate>
  );
}
```

---

## Migration Guide

### Step 1: Identify Template Match
Review your page and match it to one of the 8 templates based on:
- Page purpose (browse, detail, dashboard, checkout, etc.)
- User type (public, portal, admin)
- Layout requirements

### Step 2: Extract Data Logic
Move all data fetching and state management to hooks:
```tsx
// Before
export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... 200+ lines of logic and JSX
}

// After
export default function EventsPage() {
  const { events, loading, filters, handleFilterChange } = useEvents();
  
  return (
    <PublicBrowseTemplate
      items={events}
      loading={loading}
      // ... props
    />
  );
}
```

### Step 3: Map Components to Props
Replace inline JSX with template props:
```tsx
// Before
<div className="grid grid-cols-3 gap-4">
  {events.map(event => <EventCard key={event.id} event={event} />)}
</div>

// After
<PublicBrowseTemplate
  items={events}
  renderItem={(event) => <EventCard event={event} />}
  gridColumns={3}
  gap="lg"
/>
```

### Step 4: Remove CSS Modules
Delete the page-specific CSS module - the template handles all styling.

### Step 5: Test & Verify
- ✅ Visual appearance matches original
- ✅ All interactions work
- ✅ Responsive behavior correct
- ✅ Loading states display
- ✅ Empty states display

---

## Design System Compliance

All templates automatically enforce:

### 1. CSS Modules Only
```tsx
// ✅ Correct - Template handles styling
<PublicBrowseTemplate />

// ❌ Wrong - No Tailwind classes
<div className="flex gap-4 p-8">
```

### 2. Design Tokens
```css
/* ✅ All template CSS uses tokens */
.title {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-block-end: var(--spacing-lg);
}
```

### 3. Logical Properties
```css
/* ✅ Templates use logical properties */
padding-inline: var(--spacing-md);
margin-block-end: var(--spacing-lg);

/* ❌ Never directional */
padding-left: 16px;
margin-bottom: 24px;
```

### 4. Accessibility
All templates include:
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Screen reader support

---

## Performance Optimization

### Loading States
All templates include optimized loading skeletons:
```tsx
<PublicBrowseTemplate
  loading={true}
  loadingCount={6} // Number of skeleton items
/>
```

### Code Splitting
Templates are automatically code-split:
```tsx
// Lazy load template
const PublicBrowseTemplate = lazy(() => 
  import('@/design-system/components/templates')
);
```

### Image Optimization
Templates use Next.js Image component:
```tsx
<DetailViewTemplate
  heroImage="/events/hero.jpg" // Automatically optimized
/>
```

---

## Testing

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import { PublicBrowseTemplate } from '@/design-system/components/templates';

describe('PublicBrowseTemplate', () => {
  it('renders empty state when no items', () => {
    render(
      <PublicBrowseTemplate
        title="Events"
        items={[]}
        renderItem={() => null}
        emptyState={{ title: "No events" }}
      />
    );
    
    expect(screen.getByText('No events')).toBeInTheDocument();
  });
});
```

### Integration Tests
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import EventsPage from '@/app/(public)/events/page';

describe('EventsPage', () => {
  it('displays events using template', async () => {
    render(<EventsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('DISCOVER EVENTS')).toBeInTheDocument();
    });
  });
});
```

---

## Troubleshooting

### Issue: Type conflicts
**Solution:** Use template-specific type names
```tsx
// ✅ Correct
import type { DetailViewActionButton } from '@/design-system/components/templates';

// ❌ Wrong - conflicts with AdminDetailTemplate
import type { ActionButton } from '@/design-system/components/templates';
```

### Issue: Styling not applying
**Solution:** Ensure CSS module is imported
```tsx
// Template file should have:
import styles from './TemplateName.module.css';
```

### Issue: Template not responsive
**Solution:** Check viewport meta tag in layout
```tsx
// app/layout.tsx
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## Support

For questions or issues:
1. Check this guide
2. Review template source code
3. Check design system documentation
4. Contact: support@gvteway.com

---

**Last Updated:** January 10, 2025  
**Version:** 1.0.0
