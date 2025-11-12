# Subdomain Routing Configuration

## Overview

GVTEWAY uses subdomain-based routing to separate public-facing content from authenticated dashboards:

- **Main Domain** (`gvteway.com`) - Public pages (events, shop, membership, etc.)
- **App Subdomain** (`app.gvteway.com`) - Authenticated dashboards (organization, member, legend)

## Route Structure

### Main Domain Routes (`gvteway.com`)

```
(public)/
├── page.tsx              # Homepage
├── events/               # Public events listing
├── shop/                 # E-commerce
├── music/                # Music content
├── news/                 # News/blog
├── adventures/           # Adventures content
├── membership/           # Membership info & signup
├── privacy/              # Privacy policy
├── terms/                # Terms of service
└── cookies/              # Cookie policy

(auth)/
├── login/                # Login page
├── signup/               # Signup page
├── callback/             # Auth callback
└── onboarding/           # Post-signup onboarding
```

### App Subdomain Routes (`app.gvteway.com`)

```
(legend)/                 # Platform admin (SaaS dev team)
├── page.tsx              # Dashboard at /
├── organizations/        # Multi-tenant org management
├── venues/               # Venue management
├── vendors/              # Vendor management
├── budgets/              # Budget tracking
├── tasks/                # Task management
├── equipment/            # Equipment inventory
├── contracts/            # Contract management
├── marketing/            # Marketing campaigns
├── staff/                # Staff management
└── membership/           # Membership management

organization/             # Organization admin
├── page.tsx              # Org dashboard
├── events/               # Event management
├── products/             # Product management
├── orders/               # Order management
├── users/                # User management
├── inventory/            # Inventory management
├── advances/             # Advance management
├── artists/              # Artist management
├── brands/               # Brand management
└── roles/                # Role management

member/                   # End-user portal
├── portal/               # Member dashboard
├── membership/           # Membership management
└── profile/              # User profile
```

## Middleware Logic

The middleware (`src/middleware.ts`) handles automatic routing:

### App Subdomain (`app.gvteway.com`)
- Root `/` redirects to `/organization` (default dashboard)
- Public routes redirect to main domain
- Authenticated routes are allowed

### Main Domain (`gvteway.com`)
- Public routes are allowed
- Dashboard routes redirect to app subdomain
- Auth routes are allowed (login/signup)

## Local Development Setup

### 1. Update `/etc/hosts`

Add these entries to test subdomain routing locally:

```bash
127.0.0.1 app.localhost
127.0.0.1 localhost
```

### 2. Environment Variables

Update `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_SUBDOMAIN_URL=http://app.localhost:3000
```

### 3. Test URLs

- Main domain: `http://localhost:3000`
- App subdomain: `http://app.localhost:3000`

## Production Setup

### Vercel Configuration

1. **Add Custom Domain**: `gvteway.com`
2. **Add Subdomain**: `app.gvteway.com`
3. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://gvteway.com
   NEXT_PUBLIC_APP_SUBDOMAIN_URL=https://app.gvteway.com
   ```

### DNS Configuration

Add these DNS records:

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
A       app     76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

## Role-Based Routing (TODO)

Future enhancement to route users to appropriate dashboard based on role:

```typescript
// In middleware.ts
if (hostname.startsWith('app.') && url.pathname === '/') {
  const user = await getUser(request);
  
  if (user?.role === 'platform_admin') {
    url.pathname = '/'; // Legend dashboard (route group)
  } else if (user?.role === 'org_admin') {
    url.pathname = '/organization';
  } else {
    url.pathname = '/member';
  }
  
  return NextResponse.redirect(url);
}
```

## Benefits

1. **Clear Separation** - Public vs authenticated content
2. **Better SEO** - Public pages on main domain
3. **Security** - Dashboards isolated on subdomain
4. **User Experience** - Clear context from URL
5. **Analytics** - Easy to segment traffic by subdomain
