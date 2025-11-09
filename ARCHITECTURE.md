# GVTEWAY Platform Architecture
**Version:** 26.0.0  
**Last Updated:** November 9, 2025

---

## 📁 Repository Structure

```
grasshopper26.00/
├── .github/              # GitHub Actions workflows & templates
├── docs/                 # 📚 Documentation (organized by category)
│   ├── api/             # API documentation
│   ├── architecture/    # System architecture docs
│   ├── database/        # Database schemas & migrations
│   ├── deployment/      # Deployment guides
│   ├── features/        # Feature specifications
│   ├── security/        # Security documentation
│   ├── archive/         # Historical documents
│   └── *.md             # Current documentation
├── infrastructure/      # Infrastructure as Code (Terraform)
├── public/              # Static assets
├── scripts/             # Build & deployment scripts
├── src/                 # 💻 Source code
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── design-system/  # Design system components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   └── types/          # TypeScript type definitions
├── supabase/            # Supabase configuration & migrations
├── tests/               # Test suites
└── *.config.*           # Configuration files
```

---

## 🏗️ Architecture Overview

### Technology Stack
- **Framework:** Next.js 15.5.6 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL (Supabase)
- **Styling:** TailwindCSS + Design System
- **Authentication:** Supabase Auth
- **Deployment:** Vercel
- **Testing:** Vitest + React Testing Library

### Key Features
- 🎯 **RBAC System** - Role-based access control
- 🤖 **AI Insights** - Predictive analytics
- 📊 **Analytics** - Sponsor & investor dashboards
- 📱 **Mobile-First** - Offline-capable staff tools
- 🏢 **White-Label** - Multi-brand platform
- 💰 **Dynamic Pricing** - Revenue optimization
- 🎫 **Production Advancing** - UberEats-style workflow

---

## 📂 Source Code Organization

### `/src/app` - Application Pages
```
app/
├── (auth)/              # Authentication pages
├── (portal)/            # Member portal
├── (public)/            # Public pages
├── admin/               # Admin dashboard
│   ├── analytics/      # Analytics dashboards
│   ├── brands/         # Brand management
│   ├── roles/          # Role management
│   └── tickets/        # Ticketing admin
├── staff/               # Staff tools
│   ├── dashboard/      # Staff dashboard
│   └── scanner/        # QR scanner
└── api/                 # API routes
```

### `/src/components` - React Components
```
components/
├── admin/               # Admin-specific components
├── animations/          # Animation components
├── event-roles/         # Event role components
├── features/            # Feature-specific components
├── portal/              # Portal components
└── ui/                  # Shared UI components
```

### `/src/lib` - Utility Libraries
```
lib/
├── ai/                  # AI & ML utilities
├── api/                 # API utilities
├── performance/         # Performance optimization
├── rbac/                # RBAC implementation
├── supabase/            # Supabase client
└── utils/               # General utilities
```

### `/src/design-system` - Design System
```
design-system/
├── components/
│   ├── atoms/          # Basic building blocks
│   ├── molecules/      # Composite components
│   ├── organisms/      # Complex components
│   └── templates/      # Page templates
├── tokens/              # Design tokens
└── utils/               # Design utilities
```

---

## 🗄️ Database Architecture

### Supabase Setup
- **Project:** zunesxhsexrqjrroeass.supabase.co
- **Migrations:** 34 applied
- **RLS:** Enabled on all tables
- **Auth:** Supabase Auth with RBAC

### Key Tables
- `user_profiles` - User data & roles
- `events` - Event management
- `tickets` - Ticketing system
- `orders` - Order processing
- `memberships` - Membership management
- `brands` - Multi-brand support
- `advance_requests` - Production advancing

---

## 🔐 Security Architecture

### Authentication & Authorization
- **Auth Provider:** Supabase Auth
- **RBAC:** Custom role-based access control
- **RLS:** Row-level security on all tables
- **Session:** Secure cookie-based sessions

### Role Hierarchy
```
Super Admin
├── Event Admin
│   ├── Event Manager
│   │   ├── Event Staff
│   │   └── Event Volunteer
│   ├── Event Sponsor
│   └── Event Investor
└── Team Member
    ├── Member (Active)
    ├── Member (Inactive)
    └── Member (Suspended)
```

---

## 📊 Performance Optimization

### Caching Strategy
- **Permission Cache:** 5 min TTL
- **Role Cache:** 10 min TTL
- **Event Cache:** 15 min TTL
- **Query Memoization:** 1 min TTL

### Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting
- Lazy loading for non-critical features

### Bundle Optimization
- Tree shaking enabled
- Dead code elimination
- Minification & compression
- Image optimization

---

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests:** Component logic
- **Integration Tests:** API routes
- **E2E Tests:** Critical workflows
- **Accessibility Tests:** WCAG compliance

### Test Files Location
```
tests/
├── accessibility/       # A11y tests
├── api/                 # API tests
├── components/          # Component tests
├── design-system/       # Design system tests
├── integration/         # Integration tests
└── utils/               # Utility tests
```

---

## 🚀 Deployment Architecture

### Environments
- **Development:** Local (localhost:3000)
- **Staging:** Vercel Preview
- **Production:** Vercel Production

### CI/CD Pipeline
```
GitHub Push
  ↓
GitHub Actions
  ├── Lint Check
  ├── Type Check
  ├── Unit Tests
  └── Build Verification
  ↓
Vercel Deployment
  ├── Preview (PRs)
  └── Production (main)
```

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`

---

## 📚 Documentation Structure

### Active Documentation
- `README.md` - Project overview
- `ARCHITECTURE.md` - This file
- `/docs/FINAL_ROADMAP_COMPLETION.md` - Roadmap status
- `/docs/ZERO_TOLERANCE_BUILD_VALIDATION.md` - Build validation
- `/docs/RBAC_DEVELOPER_GUIDE.md` - RBAC guide

### Archived Documentation
- `/docs/archive/` - Historical documents

---

## 🔄 Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Standards
- **TypeScript:** Strict mode enabled
- **ESLint:** Zero warnings policy
- **Prettier:** Automatic formatting
- **Accessibility:** WCAG 2.1 AA compliance

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Database connection pooling
- CDN for static assets
- Edge functions for global performance

### Vertical Scaling
- Query optimization
- Caching layers
- Database indexing
- Bundle size optimization

---

## 🛠️ Maintenance

### Regular Tasks
- Dependency updates (monthly)
- Security audits (quarterly)
- Performance reviews (quarterly)
- Documentation updates (as needed)

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Database monitoring (Supabase Dashboard)
- User analytics (Custom implementation)

---

## 📞 Support & Resources

### Documentation
- **Developer Guide:** `/docs/RBAC_DEVELOPER_GUIDE.md`
- **API Docs:** `/docs/api/`
- **Database Schema:** `/docs/database/`

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated:** November 9, 2025  
**Version:** 26.0.0  
**Status:** Production Ready ✅
