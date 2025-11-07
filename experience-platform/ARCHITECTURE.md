# Experience Platform Architecture

## Directory Structure

```
experience-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   ├── admin/             # Admin dashboard routes
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin API endpoints
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── checkout/      # Checkout & payment endpoints
│   │   │   ├── favorites/     # User favorites
│   │   │   ├── upload/        # File upload
│   │   │   ├── users/         # User management
│   │   │   ├── v1/            # Versioned API (primary)
│   │   │   │   ├── analytics/ # Analytics endpoints
│   │   │   │   ├── artists/   # Artist CRUD
│   │   │   │   ├── events/    # Event CRUD
│   │   │   │   ├── notifications/ # Notifications
│   │   │   │   ├── orders/    # Order management
│   │   │   │   ├── products/  # Product CRUD
│   │   │   │   ├── search/    # Search endpoints
│   │   │   │   └── tickets/   # Ticket operations
│   │   │   └── webhooks/      # External webhooks (Stripe)
│   │   ├── artists/           # Artist pages
│   │   ├── auth/              # Auth pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   ├── cookies/           # Cookie policy
│   │   ├── events/            # Event pages
│   │   ├── favorites/         # User favorites
│   │   ├── orders/            # Order history
│   │   ├── privacy/           # Privacy policy
│   │   ├── profile/           # User profile
│   │   ├── shop/              # Merchandise shop
│   │   ├── terms/             # Terms of service
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   │
│   ├── components/            # React components
│   │   ├── admin/             # Admin-specific components
│   │   ├── features/          # Feature components
│   │   │   ├── add-to-cart-button.tsx
│   │   │   ├── cart-button.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── ticket-display.tsx
│   │   │   └── ticket-selector.tsx
│   │   ├── privacy/           # Privacy components
│   │   ├── seo/               # SEO components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── error-boundary.tsx
│   │   ├── theme-provider.tsx
│   │   └── index.ts           # Barrel exports
│   │
│   ├── design-system/         # Design tokens & system
│   │
│   ├── hooks/                 # Custom React hooks
│   │
│   ├── lib/                   # Core utilities & services
│   │   ├── accessibility/     # A11y utilities
│   │   ├── analytics/         # Analytics tracking
│   │   ├── api/               # API utilities
│   │   │   ├── error-handler.ts
│   │   │   ├── middleware.ts
│   │   │   └── rate-limiter.ts
│   │   ├── cache/             # Redis caching
│   │   ├── email/             # Email services
│   │   │   ├── email-tokens.ts
│   │   │   ├── send.ts
│   │   │   └── templates.ts
│   │   ├── i18n/              # Internationalization
│   │   ├── integrations/      # External integrations
│   │   │   └── atlvs.ts       # ATLVS integration
│   │   ├── monitoring/        # Logging & monitoring
│   │   ├── performance/       # Performance optimization
│   │   ├── privacy/           # Privacy management
│   │   ├── security/          # Security utilities
│   │   │   ├── csrf.ts
│   │   │   ├── headers.ts
│   │   │   ├── rls-helpers.ts
│   │   │   └── sanitize.ts
│   │   ├── services/          # Business logic services
│   │   │   ├── event.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── order.service.ts
│   │   │   └── upload.service.ts
│   │   ├── store/             # State management (Zustand)
│   │   │   └── cart-store.ts
│   │   ├── stripe/            # Stripe integration
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── supabase/          # Supabase client
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   └── server.ts
│   │   ├── tickets/           # Ticket utilities
│   │   │   ├── pdf-generator.ts
│   │   │   └── qr-generator.ts
│   │   ├── validations/       # Zod schemas
│   │   │   └── schemas.ts
│   │   ├── utils.ts           # General utilities
│   │   └── index.ts           # Barrel exports
│   │
│   ├── types/                 # TypeScript type definitions
│   │
│   └── middleware.ts          # Next.js middleware
│
├── supabase/                  # Database & backend
│   ├── migrations/            # SQL migrations
│   └── functions/             # Edge functions
│
├── tests/                     # Test suites
│
├── scripts/                   # Utility scripts
│   ├── deploy.sh
│   ├── migrate-colors.sh
│   └── validate-tokens.ts
│
├── public/                    # Static assets
│
├── docs/                      # Technical documentation
│   ├── api/                   # API documentation
│   ├── guides/                # Setup & integration guides
│   ├── architecture/          # Architecture docs
│   ├── audits/                # Audit reports
│   ├── implementation/        # Implementation reports
│   └── archive/               # Historical docs
│
└── [config files]             # Configuration files

```

## API Structure

### API Versioning Strategy

The API uses a versioned approach with `/api/v1/` as the primary stable API:

- **`/api/v1/*`** - Versioned, stable API with full validation, error handling, and rate limiting
- **`/api/*`** - Legacy endpoints (being phased out in favor of v1)
- **`/api/admin/*`** - Admin-specific endpoints
- **`/api/auth/*`** - Authentication endpoints
- **`/api/webhooks/*`** - External webhook handlers

### API Route Organization

```
/api/v1/
├── analytics/dashboard     # Analytics data
├── artists/               # Artist CRUD
│   ├── GET /              # List artists
│   ├── POST /             # Create artist
│   └── /:id/              # Get/Update/Delete artist
├── events/                # Event CRUD
│   ├── GET /              # List events
│   ├── POST /             # Create event
│   └── /:id/              # Get/Update/Delete event
├── notifications/         # Notification management
├── orders/                # Order management
│   ├── GET /              # List orders
│   ├── /:id/              # Get order
│   └── /:id/refund/       # Refund order
├── products/              # Product CRUD
│   ├── GET /              # List products
│   ├── POST /             # Create product
│   └── /:id/              # Get/Update/Delete product
├── search/                # Global search
└── tickets/               # Ticket operations
    ├── /:id/scan/         # Scan ticket
    └── /:id/transfer/     # Transfer ticket
```

## Component Architecture

### Component Organization

Components are organized by purpose:

1. **`/ui`** - Base UI components (shadcn/ui)
2. **`/features`** - Feature-specific components
3. **`/admin`** - Admin dashboard components
4. **`/privacy`** - Privacy & compliance components
5. **`/seo`** - SEO components

### Barrel Exports

Use barrel exports for cleaner imports:

```typescript
// Instead of:
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Use:
import { Button, Card } from '@/components'
```

## Library Structure

### Service Layer

Business logic is organized into service classes:

- **`EventService`** - Event management
- **`OrderService`** - Order processing
- **`NotificationService`** - Notifications
- **`UploadService`** - File uploads

### Security Layer

Comprehensive security utilities:

- **Sanitization** - Input sanitization to prevent XSS
- **CSRF Protection** - Token-based CSRF protection
- **Headers** - Security headers middleware
- **RLS Helpers** - Row-level security helpers

### Integration Layer

External service integrations:

- **Supabase** - Database & auth
- **Stripe** - Payments
- **ATLVS** - Production management
- **Email** - Transactional email (Resend)

## State Management

### Zustand Stores

- **`cart-store.ts`** - Shopping cart state
- Persisted to localStorage
- Type-safe with TypeScript

## Data Flow

```
User Action
    ↓
React Component
    ↓
API Route (/api/v1/*)
    ↓
Service Layer (lib/services/)
    ↓
Supabase Client (lib/supabase/)
    ↓
Database (PostgreSQL)
```

## Best Practices

### Import Paths

Use TypeScript path aliases:

```typescript
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components'
import { EventService } from '@/lib/services/event.service'
```

### API Routes

1. Use v1 API for all new endpoints
2. Include proper error handling with `asyncHandler`
3. Apply rate limiting with `rateLimit`
4. Validate inputs with Zod schemas
5. Sanitize all user inputs

### Components

1. Use TypeScript for type safety
2. Implement error boundaries
3. Use React Server Components where possible
4. Lazy load heavy components
5. Follow accessibility guidelines

### Security

1. Always sanitize user inputs
2. Use CSRF tokens for mutations
3. Implement rate limiting
4. Apply Row Level Security (RLS) in Supabase
5. Set security headers

## Performance Optimization

- Server Components for static content
- Client Components only when needed
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Redis caching for frequently accessed data
- Database query optimization

## Testing Strategy

- Unit tests for utilities and services
- Integration tests for API routes
- E2E tests for critical user flows
- Component tests with React Testing Library

## Deployment

See [`docs/guides/DEPLOYMENT_GUIDE.md`](docs/guides/DEPLOYMENT_GUIDE.md) for deployment instructions.

## Documentation

- **API Docs**: [`docs/api/API_DOCUMENTATION.md`](docs/api/API_DOCUMENTATION.md)
- **Setup Guide**: [`docs/guides/SETUP.md`](docs/guides/SETUP.md)
- **Integration Guide**: [`docs/guides/INTEGRATION.md`](docs/guides/INTEGRATION.md)
