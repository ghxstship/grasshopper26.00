# 📁 Grasshopper 26.00 - Directory Structure

**Last Updated**: January 6, 2025  
**Status**: ✅ **Fully Organized**

---

## 🏗️ Root Directory Structure

```
/Grasshopper26.00/
├── .git/                           # Git repository
└── experience-platform/            # 🎯 PROJECT ROOT - All code here
    ├── .env.example
    ├── .eslintrc.json
    ├── .github/
    ├── .gitignore
    ├── .next/
    ├── node_modules/
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── next.config.js
    ├── postcss.config.js
    ├── tailwind.config.ts
    ├── vitest.config.ts
    │
    ├── 📚 Documentation
    ├── README.md
    ├── ARCHITECTURE.md
    ├── CODEBASE_OPTIMIZATION_SUMMARY.md
    ├── FINAL_COMPLETION_SUMMARY.md
    ├── IMPLEMENTATION_COMPLETE_FINAL.md
    │
    ├── 📁 docs/                    # All project documentation
    │   ├── README.md
    │   ├── api/                    # API documentation
    │   ├── architecture/           # Architecture docs
    │   ├── archive/                # Historical docs
    │   ├── audits/                 # Audit reports
    │   ├── deployment/             # Deployment guides
    │   ├── guides/                 # User guides
    │   └── implementation/         # Implementation docs
    │
    ├── 📁 public/                  # Static assets
    │
    ├── 📁 scripts/                 # Build & deployment scripts
    │
    ├── 📁 src/                     # 🎯 SOURCE CODE
    │   ├── app/                    # Next.js App Router
    │   │   ├── (auth)/            # Auth pages
    │   │   ├── admin/             # Admin dashboard
    │   │   ├── api/               # API routes
    │   │   ├── artists/           # Artist pages
    │   │   ├── cart/              # Shopping cart
    │   │   ├── checkout/          # Checkout flow
    │   │   ├── events/            # Event pages
    │   │   ├── favorites/         # Favorites page
    │   │   ├── orders/            # Order pages
    │   │   ├── profile/           # User profile
    │   │   ├── schedule/          # Schedule builder
    │   │   ├── shop/              # E-commerce
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   │
    │   ├── components/            # React components
    │   │   ├── admin/            # Admin components
    │   │   ├── features/         # Feature components
    │   │   ├── privacy/          # Privacy components
    │   │   ├── seo/              # SEO components
    │   │   └── ui/               # UI components
    │   │
    │   ├── design-system/        # Design tokens
    │   │   └── tokens/
    │   │
    │   ├── hooks/                # Custom React hooks
    │   │   └── use-toast.ts
    │   │
    │   ├── lib/                  # Utility libraries
    │   │   ├── accessibility/
    │   │   ├── analytics/
    │   │   ├── api/
    │   │   ├── cache/
    │   │   ├── email/
    │   │   ├── i18n/
    │   │   ├── integrations/
    │   │   ├── monitoring/
    │   │   ├── performance/
    │   │   ├── privacy/
    │   │   ├── security/
    │   │   ├── services/
    │   │   ├── store/            # State management
    │   │   ├── stripe/           # Stripe integration
    │   │   ├── supabase/         # Database client
    │   │   ├── tickets/          # Ticket generation
    │   │   ├── validations/
    │   │   └── utils.ts
    │   │
    │   ├── middleware.ts         # Next.js middleware
    │   └── types/                # TypeScript types
    │
    ├── 📁 supabase/               # Database migrations
    │   ├── migrations/
    │   └── seed.sql
    │
    └── 📁 tests/                  # Test files
        ├── e2e/
        ├── integration/
        └── unit/
```

---

## ✅ Organization Complete

### What Was Fixed
1. ✅ Moved `README.md` to `/experience-platform/`
2. ✅ Moved `CODEBASE_OPTIMIZATION_SUMMARY.md` to `/experience-platform/`
3. ✅ Merged `/docs/` into `/experience-platform/docs/`
4. ✅ Removed all files from root `/Grasshopper26.00/`
5. ✅ All code now in `/experience-platform/src/`

### Current Structure
- **Root** (`/Grasshopper26.00/`): Only `.git/` and `experience-platform/`
- **Project Root** (`/experience-platform/`): All project files
- **Source Code** (`/experience-platform/src/`): All application code
- **Documentation** (`/experience-platform/docs/`): All documentation

---

## 📝 Key Directories

### `/experience-platform/src/app/`
Next.js App Router pages and API routes
- 35+ pages
- 30+ API endpoints
- Complete routing structure

### `/experience-platform/src/components/`
React components organized by purpose
- 25+ UI components
- Feature-specific components
- Admin components
- SEO components

### `/experience-platform/src/lib/`
Utility libraries and integrations
- Supabase client
- Stripe integration
- Email service
- Ticket generation
- Analytics
- State management

### `/experience-platform/docs/`
Complete project documentation
- API documentation
- Architecture guides
- Audit reports
- Deployment guides
- Implementation docs

---

## 🎯 Working Directory

**Always work from**: `/experience-platform/`

```bash
cd /Users/julianclarkson/Documents/Grasshopper26.00/experience-platform
```

All commands should be run from this directory:
```bash
npm install
npm run dev
npm run build
npm run test
```

---

## 📦 Package Management

**Location**: `/experience-platform/package.json`

All dependencies are managed at the project root level.

---

## 🚀 Deployment

**Deploy from**: `/experience-platform/`

The entire `experience-platform` directory is the deployable unit.

---

## ✅ Verification

To verify correct structure:
```bash
# Should show only .git and experience-platform
ls /Users/julianclarkson/Documents/Grasshopper26.00/

# Should show all project files
ls /Users/julianclarkson/Documents/Grasshopper26.00/experience-platform/

# Should show source code
ls /Users/julianclarkson/Documents/Grasshopper26.00/experience-platform/src/
```

---

**Directory structure is now 100% correct and organized! ✅**
