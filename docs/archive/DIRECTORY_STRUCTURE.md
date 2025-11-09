# 📁 GVTEWAY Platform - Directory Structure

**Last Updated**: January 11, 2025  
**Status**: ✅ **Optimized for Enterprise Scale**

---

## 🏗️ Root Directory Structure

```
/Grasshopper26.00/
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment (gitignored)
├── .eslintrc.json                  # ESLint configuration
├── .git/                           # Git repository
├── .github/                        # GitHub workflows & templates
├── .gitignore                      # Git ignore rules
├── .next/                          # Next.js build output
├── node_modules/                   # Dependencies
│
├── 📚 Core Documentation
├── README.md                       # Main project documentation
├── DIRECTORY_STRUCTURE.md          # This file
│
├── 📁 docs/                        # Complete documentation library
│   ├── README.md                   # Documentation index
│   ├── api/                        # API documentation
│   ├── architecture/               # Architecture & design docs
│   ├── archive/                    # Historical completion reports
│   ├── audits/                     # Quality & security audits
│   ├── deployment/                 # Deployment guides
│   ├── guides/                     # User & developer guides
│   └── implementation/             # Feature implementation docs
│
├── 📁 public/                      # Static assets
│   ├── api-docs/                   # OpenAPI specification
│   ├── manifest.json               # PWA manifest
│   ├── robots.txt                  # SEO robots file
│   └── sw.js                       # Service worker
│
├── 📁 scripts/                     # Build & deployment automation
│   ├── analyze-migration-compatibility.js
│   ├── deploy.sh
│   ├── generate-safe-migration.js
│   └── inspect-remote-schema.js
│
├── 📁 src/                         # 🎯 APPLICATION SOURCE CODE
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                # Authentication pages
│   │   ├── (portal)/              # Portal pages
│   │   ├── (public)/              # Public pages
│   │   ├── admin/                 # Admin dashboard
│   │   ├── api/                   # API routes (30+ endpoints)
│   │   ├── artists/               # Artist directory & profiles
│   │   ├── cart/                  # Shopping cart
│   │   ├── events/                # Event pages & details
│   │   ├── favorites/             # User favorites
│   │   ├── membership/            # Membership flows
│   │   ├── orders/                # Order management
│   │   ├── profile/               # User profile
│   │   ├── schedule/              # Schedule builder
│   │   ├── shop/                  # E-commerce
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page
│   │
│   ├── components/                # React components (Atomic Design)
│   │   ├── admin/                 # Admin-specific components
│   │   ├── animations/            # Animation components
│   │   ├── features/              # Feature-specific components
│   │   ├── membership/            # Membership components
│   │   ├── privacy/               # Privacy & consent components
│   │   ├── seo/                   # SEO components
│   │   ├── ui/                    # Reusable UI components (28+)
│   │   ├── error-boundary.tsx     # Error boundary wrapper
│   │   ├── index.ts               # Component exports
│   │   └── theme-provider.tsx     # Theme context provider
│   │
│   ├── design-system/             # Atomic Design System
│   │   ├── components/            # Design system components
│   │   ├── tokens/                # Design tokens (14 files)
│   │   │   ├── animation.ts       # Animation tokens
│   │   │   ├── borders.ts         # Border tokens
│   │   │   ├── breakpoints.ts     # Responsive breakpoints
│   │   │   ├── colors.ts          # Color palette
│   │   │   ├── effects.ts         # Visual effects
│   │   │   ├── gradients.ts       # Gradient definitions
│   │   │   ├── index.ts           # Token exports
│   │   │   ├── shadows.ts         # Shadow tokens
│   │   │   ├── spacing.ts         # Spacing scale
│   │   │   └── typography.ts      # Typography tokens
│   │   └── utils/                 # Design system utilities
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-media-query.ts
│   │   ├── use-scroll-position.ts
│   │   ├── use-toast.ts
│   │   └── use-window-size.ts
│   │
│   ├── i18n/                      # Internationalization
│   │   ├── config.ts
│   │   ├── locales/
│   │   └── translations/
│   │
│   ├── lib/                       # Core libraries & utilities
│   │   ├── accessibility/         # A11y utilities
│   │   ├── analytics/             # Analytics integration
│   │   ├── api/                   # API client utilities
│   │   ├── cache/                 # Caching layer
│   │   ├── email/                 # Email service
│   │   ├── integrations/          # Third-party integrations
│   │   ├── monitoring/            # Error monitoring (Sentry)
│   │   ├── performance/           # Performance optimization
│   │   ├── privacy/               # Privacy & GDPR utilities
│   │   ├── security/              # Security utilities
│   │   ├── services/              # Business logic services
│   │   ├── store/                 # State management (Zustand)
│   │   ├── stripe/                # Stripe payment integration
│   │   ├── supabase/              # Supabase client & utilities
│   │   ├── tickets/               # Ticket generation & QR codes
│   │   ├── validations/           # Form validation schemas
│   │   └── utils.ts               # General utilities
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── database.types.ts      # Supabase generated types
│   │   ├── global.d.ts            # Global type declarations
│   │   └── index.ts               # Type exports
│   │
│   ├── instrumentation.ts         # Next.js instrumentation
│   ├── instrumentation-client.ts  # Client-side instrumentation
│   └── middleware.ts              # Next.js middleware (auth, etc.)
│
├── 📁 supabase/                   # Database & backend
│   ├── .branches/                 # Branch management
│   ├── functions/                 # Edge functions
│   ├── migrations/                # Database migrations (18 files)
│   ├── query_tables.sql           # Table queries
│   ├── remote_schema.sql          # Remote schema
│   └── remote_schema_dump.sql     # Schema dump
│
├── 📁 tests/                      # Test suites
│   ├── accessibility/             # A11y tests
│   ├── api/                       # API tests
│   ├── e2e/                       # End-to-end tests (Playwright)
│   ├── services/                  # Service tests
│   └── setup.ts                   # Test configuration
│
├── 📦 Configuration Files
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies & scripts
├── package-lock.json              # Dependency lock file
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.tsbuildinfo           # TypeScript build cache
├── vercel.json                    # Vercel deployment config
├── vitest.config.ts               # Vitest test configuration
├── vitest.setup.ts                # Vitest setup
├── sentry.client.config.ts        # Sentry client config
├── sentry.edge.config.ts          # Sentry edge config
└── sentry.server.config.ts        # Sentry server config
```

---

## 🎯 Key Principles

### Atomic Design System
Components follow atomic design methodology:
- **Atoms**: Basic UI elements (`/src/components/ui/`)
- **Molecules**: Simple component combinations
- **Organisms**: Complex UI sections (`/src/components/features/`)
- **Templates**: Page layouts (`/src/app/**/layout.tsx`)
- **Pages**: Complete pages (`/src/app/**/page.tsx`)

### Scalability Architecture
- **Modular structure**: Each feature is self-contained
- **Clear separation**: UI, business logic, and data layers
- **Type safety**: Full TypeScript coverage
- **Performance**: Optimized imports and code splitting
- **Testing**: Comprehensive test coverage

---

## 📝 Working Directory

**Project Root**: `/Users/julianclarkson/Documents/Grasshopper26.00/`

### Common Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Quality Assurance
npm run lint             # Run ESLint
npm run type-check       # TypeScript validation
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests

# Database
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database
```

---

## 🚀 Deployment

**Platform**: Vercel  
**Database**: Supabase (shared with ATLVS/Dragonfly26.00)  
**CDN**: Vercel Edge Network  
**Monitoring**: Sentry

### Environment Variables
Required in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `SENTRY_DSN`

---

## ✅ Optimization Status

### Completed
- ✅ Consolidated 27 root-level docs to `docs/archive/`
- ✅ Moved SQL files to `supabase/`
- ✅ Moved instrumentation files to `src/`
- ✅ Atomic design system structure validated
- ✅ Component organization optimized
- ✅ Type definitions centralized

### Architecture Benefits
- **Clean root**: Only essential config files
- **Organized docs**: All documentation in `docs/`
- **Scalable structure**: Ready for team growth
- **Clear patterns**: Easy onboarding for new developers
- **Type safety**: Full TypeScript coverage
- **Test coverage**: Comprehensive testing strategy

---

**Directory structure optimized for enterprise-scale deployment! ✅**
