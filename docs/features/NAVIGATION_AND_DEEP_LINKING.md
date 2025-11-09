# Navigation & Deep Linking Guide

## Overview

GVTEWAY implements comprehensive navigation and deep linking features to enhance user experience and enable seamless navigation throughout the application.

## Breadcrumb Navigation

### Implementation

Breadcrumb navigation is automatically generated based on the current route using the `useBreadcrumbs` hook and displayed via the `Breadcrumb` component.

### Usage

#### In Admin Routes

Breadcrumbs are automatically included in the admin layout:

```tsx
// Already integrated in /src/app/admin/layout.tsx
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs'

<AdminBreadcrumbs />
```

#### In Custom Pages

For custom pages outside the admin area, use the `PageBreadcrumbs` component:

```tsx
import { PageBreadcrumbs } from '@/components/ui/page-breadcrumbs'

export default function MyPage() {
  return (
    <div>
      <PageBreadcrumbs />
      {/* Page content */}
    </div>
  )
}
```

#### Manual Breadcrumbs

For complete control, use the `Breadcrumb` component directly:

```tsx
import { Breadcrumb } from '@/components/ui/breadcrumb'

const items = [
  { label: 'Events', href: '/events' },
  { label: 'Summer Festival 2024', href: '/events/summer-festival-2024' },
  { label: 'Tickets' }, // Current page (no href)
]

<Breadcrumb items={items} showHome={true} />
```

### Route Configuration

The breadcrumb system automatically generates breadcrumbs for common routes. To customize breadcrumbs for specific routes, edit `/src/hooks/use-breadcrumbs.ts`:

```typescript
{
  pattern: /^\/custom\/route\/([^/]+)$/,
  generator: (pathname, matches) => [
    { label: 'Custom', href: '/custom' },
    { label: 'Route Details' },
  ],
}
```

### Supported Routes

Breadcrumbs are automatically generated for:

- **Admin Routes**: Dashboard, Events, Orders, Products, Artists, Users, Analytics
- **Public Routes**: Artists, Shop, News, Legal pages
- **User Routes**: Profile, Orders, Favorites, Schedule, Cart, Checkout
- **Membership Routes**: Membership tiers and checkout

## Deep Linking

### Overview

Deep linking utilities enable generating and parsing complex URLs with query parameters, hash fragments, and UTM tracking.

### Basic Usage

```typescript
import { deepLinks } from '@/lib/deep-linking'

// Generate event link
const eventLink = deepLinks.event('summer-fest-2024')
// Result: /events/summer-fest-2024

// Generate event link with section
const ticketsLink = deepLinks.event('summer-fest-2024', { section: 'tickets' })
// Result: /events/summer-fest-2024?section=tickets

// Generate checkout link
const checkoutLink = deepLinks.eventCheckout('summer-fest-2024', 'vip')
// Result: /checkout?event=summer-fest-2024&ticketType=vip
```

### Available Deep Link Generators

#### Events
```typescript
deepLinks.event(eventId, { section?, ticketType? })
deepLinks.eventCheckout(eventId, ticketType?)
```

#### Artists
```typescript
deepLinks.artist(artistSlug, { tab? })
```

#### Products
```typescript
deepLinks.product(productSlug, { variant? })
```

#### Orders
```typescript
deepLinks.order(orderId, { highlight? })
```

#### Admin
```typescript
deepLinks.adminEvent(eventId, action?) // action: 'edit' | 'tickets'
deepLinks.adminOrder(orderId, action?) // action: 'refund'
```

#### User Profile
```typescript
deepLinks.profile(section?) // section: 'orders' | 'favorites' | 'settings'
```

#### Membership
```typescript
deepLinks.membership(tier?)
deepLinks.membershipCheckout(tier)
```

#### Schedule
```typescript
deepLinks.schedule({ date?, filter? })
```

#### Cart
```typescript
deepLinks.cart({ promo? })
```

#### News
```typescript
deepLinks.newsArticle(articleSlug, { comment? })
```

### Custom Deep Links

For custom deep links, use the `generateDeepLink` function:

```typescript
import { generateDeepLink } from '@/lib/deep-linking'

const customLink = generateDeepLink({
  path: '/custom/path',
  params: {
    filter: 'active',
    page: 2,
    sort: 'date',
  },
  hash: 'section-details',
})
// Result: /custom/path?filter=active&page=2&sort=date#section-details
```

### Shareable Links with UTM Tracking

Generate shareable links with UTM parameters for marketing campaigns:

```typescript
import { generateShareableLink } from '@/lib/deep-linking'

const shareLink = generateShareableLink('/events/summer-fest-2024', {
  source: 'email',
  medium: 'newsletter',
  campaign: 'summer-2024',
  content: 'hero-banner',
})
// Result: /events/summer-fest-2024?utm_source=email&utm_medium=newsletter&utm_campaign=summer-2024&utm_content=hero-banner
```

### Parsing Deep Links

Extract information from URLs:

```typescript
import { parseDeepLink } from '@/lib/deep-linking'

const { path, params, hash } = parseDeepLink(
  'https://gvteway.com/events/summer-fest?section=tickets#pricing'
)
// path: '/events/summer-fest'
// params: { section: 'tickets' }
// hash: 'pricing'
```

### URL Validation

Check if a URL is internal to the application:

```typescript
import { isInternalLink } from '@/lib/deep-linking'

isInternalLink('https://gvteway.com/events') // true
isInternalLink('https://external.com/page') // false
isInternalLink('/events') // true (relative URLs are internal)
```

### Preserving Query Parameters

Maintain query parameters when navigating:

```typescript
import { preserveQueryParams } from '@/lib/deep-linking'

// Current URL: /events?utm_source=email&filter=upcoming
const newUrl = preserveQueryParams('/artists', ['utm_source'])
// Result: /artists?utm_source=email
```

### Authentication Return URLs

Generate and parse return URLs for authentication flows:

```typescript
import { generateReturnUrl, parseReturnUrl } from '@/lib/deep-linking'

// Generate return URL
const returnUrl = generateReturnUrl('/profile/orders')
// Use in login redirect
router.push(`/login?return=${returnUrl}`)

// Parse return URL after authentication
const redirectPath = parseReturnUrl(searchParams.get('return'))
router.push(redirectPath) // Safely redirects to /profile/orders or / if invalid
```

## Best Practices

### 1. Use Deep Link Generators

Always use the provided deep link generators instead of hardcoding URLs:

```typescript
// ✅ Good
<Link href={deepLinks.event(eventId)}>View Event</Link>

// ❌ Bad
<Link href={`/events/${eventId}`}>View Event</Link>
```

### 2. Preserve Context

When navigating from marketing campaigns, preserve UTM parameters:

```typescript
const link = preserveQueryParams(deepLinks.event(eventId), [
  'utm_source',
  'utm_medium',
  'utm_campaign',
])
```

### 3. Validate External Links

Always validate external links before redirecting:

```typescript
if (isInternalLink(url)) {
  router.push(url)
} else {
  window.open(url, '_blank', 'noopener,noreferrer')
}
```

### 4. Use Breadcrumbs for Context

Include breadcrumbs on pages with deep navigation hierarchies:

```typescript
// Admin pages, nested content, multi-step flows
<PageBreadcrumbs />
```

### 5. Test Deep Links

Always test deep links to ensure they work correctly:

```bash
npm run test -- deep-linking.test.ts
```

## Examples

### Event Detail Page with Deep Linking

```tsx
import { deepLinks } from '@/lib/deep-linking'
import { PageBreadcrumbs } from '@/components/ui/page-breadcrumbs'

export default function EventPage({ params }: { params: { slug: string } }) {
  const checkoutLink = deepLinks.eventCheckout(params.slug, 'general')
  
  return (
    <div>
      <PageBreadcrumbs />
      <h1>Event Details</h1>
      <Link href={checkoutLink}>Buy Tickets</Link>
    </div>
  )
}
```

### Admin Order Management

```tsx
import { deepLinks } from '@/lib/deep-linking'
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs'

export default function OrdersPage() {
  return (
    <div>
      <AdminBreadcrumbs />
      {orders.map(order => (
        <Link key={order.id} href={deepLinks.adminOrder(order.id)}>
          Order #{order.id}
        </Link>
      ))}
    </div>
  )
}
```

### Shareable Event Link

```tsx
import { generateShareableLink } from '@/lib/deep-linking'

function ShareButton({ eventSlug }: { eventSlug: string }) {
  const shareLink = generateShareableLink(`/events/${eventSlug}`, {
    source: 'app',
    medium: 'social',
    campaign: 'event-share',
  })
  
  const handleShare = () => {
    navigator.share({
      title: 'Check out this event!',
      url: `${window.location.origin}${shareLink}`,
    })
  }
  
  return <button onClick={handleShare}>Share Event</button>
}
```

## Testing

Run the deep linking test suite:

```bash
npm run test -- deep-linking.test.ts
```

## API Reference

### Components

- **`<Breadcrumb />`**: Core breadcrumb component
- **`<PageBreadcrumbs />`**: Auto-generating breadcrumbs for pages
- **`<AdminBreadcrumbs />`**: Breadcrumbs for admin routes

### Hooks

- **`useBreadcrumbs()`**: Generate breadcrumb items from current route

### Functions

- **`generateDeepLink(config)`**: Generate deep link with params and hash
- **`parseDeepLink(url)`**: Parse URL into path, params, and hash
- **`generateShareableLink(path, utmParams)`**: Generate link with UTM tracking
- **`isInternalLink(url)`**: Check if URL is internal
- **`preserveQueryParams(newPath, paramsToPreserve)`**: Preserve query params
- **`generateReturnUrl(currentPath?)`**: Generate encoded return URL
- **`parseReturnUrl(returnUrl?)`**: Parse and validate return URL

### Deep Link Generators

See the "Available Deep Link Generators" section above for the complete list.

## Troubleshooting

### Breadcrumbs Not Showing

1. Ensure the route is configured in `use-breadcrumbs.ts`
2. Check that the component is client-side (`"use client"`)
3. Verify the pathname is being read correctly

### Deep Links Not Working

1. Check that all required parameters are provided
2. Verify the path format matches the route structure
3. Ensure query parameters are properly encoded

### Return URLs Failing

1. Confirm the return URL is properly encoded
2. Check that the URL is internal (external URLs are rejected)
3. Verify the redirect logic in your authentication flow

## Future Enhancements

- [ ] Breadcrumb schema.org markup for SEO
- [ ] Deep link analytics tracking
- [ ] QR code generation for deep links
- [ ] Universal links for mobile apps
- [ ] Dynamic breadcrumb labels from API data
