# Grasshopper 26.00

**White-Label Live Entertainment Experience Platform**  
**Version:** 26.0.0  
**Status:** ✅ Foundation Complete - Ready for Development  
**Dev Server:** http://localhost:3001

---

## Overview

Grasshopper 26.00 is a comprehensive white-label platform for live entertainment brands, festivals, concerts, and events. Built with modern web technologies and designed to integrate seamlessly with ATLVS (Dragonfly26.00) production management system.

**🎉 Project Successfully Created!** The foundation is complete with Next.js 15, Supabase, Stripe integration, and ATLVS connectivity.

### Key Features

### Event Management
- Beautiful event detail pages
- Artist lineup displays
- Stage configurations
- Interactive venue maps
- Schedule builders
- Past event archives

### Artist Directory
- Detailed artist profiles
- Social media integration (Spotify, Instagram, SoundCloud)
- Performance history
- Genre categorization
- Follow functionality

### E-Commerce
- Merchandise catalog
- Product variants (sizes, colors)
- Shopping cart
- Inventory management
- Event-specific merchandise

### User Experience
- Secure authentication (email, OAuth, magic links)
- User profiles and dashboards
- Favorite artists
- Personal event schedules
- Order history

### Admin Dashboard
- Real-time analytics
- Event management
- Artist management
- Order processing
- Role-based access control (RBAC)

### Advanced Features
- Real-time search (events & artists)
- SEO optimization with structured data
- Email notifications
- Analytics tracking
- Mobile-responsive design
- Dark mode support

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State**: Zustand
- **Forms**: React Hook Form + Zod

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Email**: Resend
- **Hosting**: Vercel

### Developer Experience
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint + Prettier
- **Performance**: Server Components, Image Optimization
- **Security**: Row Level Security, RBAC

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/grasshopper26.00.git
cd grasshopper26.00

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your application.
### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui + Radix UI
- **Animations:** Framer Motion
- **State:** Zustand
- **Forms:** React Hook Form + Zod

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Stripe
- **Email:** Resend
- **Hosting:** Vercel

### Integrations
- **ATLVS:** Dragonfly26.00 production management
- **Spotify:** Artist profiles and music
- **YouTube:** Video content
- **Social Media:** Instagram, TikTok, Facebook

---

## Project Structure

```
grasshopper26.00/
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── (public)/         # Public routes
│   │   ├── (auth)/           # Auth routes
│   │   ├── (admin)/          # Admin dashboard
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature components
│   ├── lib/                  # Utilities
│   │   ├── supabase/         # Supabase client
│   │   ├── stripe/           # Stripe helpers
│   │   └── utils/            # General utilities
│   ├── hooks/                # Custom hooks
│   └── types/                # TypeScript types
├── supabase/                 # Database
│   ├── migrations/           # SQL migrations
│   └── functions/            # Edge functions
├── public/                   # Static assets
└── scripts/                  # Utility scripts
```

---

## ATLVS Integration

Grasshopper integrates with ATLVS (Dragonfly26.00) for:

- **Production Management:** Event planning and coordination
- **Resource Allocation:** Staff, equipment, venues
- **Business Operations:** Contracts, finance, procurement
- **Analytics:** Cross-platform insights and reporting

---

## Development Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript checks
npm run db:migrate       # Run database migrations
npm run db:reset         # Reset database
npm run db:seed          # Seed database
```

---

## Environment Variables

See `.env.example` for all required environment variables.

---

## License

See [LICENSE](LICENSE) file for details.

---

**Built for world-class entertainment experiences** 🎉
