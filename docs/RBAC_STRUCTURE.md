# GVTEWAY RBAC Structure

## Overview
The application is organized into 4 distinct RBAC levels using Next.js route groups for clear separation of concerns and access control.

---

## Route Groups & Access Levels

### 1. **`(legend)/` - Platform Owner Dashboard**
**Access:** @ghxstship.pro email required  
**Purpose:** Highest level platform management  
**Routes:**
- `/legend/dashboard` - Main dashboard
- `/legend/dashboard/events` - All events management
- `/legend/dashboard/organizations` - Organization management
- `/legend/dashboard/tasks` - Task management
- `/legend/dashboard/budgets` - Budget oversight
- `/legend/dashboard/venues` - Venue management
- `/legend/dashboard/vendors` - Vendor management
- `/legend/dashboard/analytics` - Platform analytics

**Layout:** Custom sidebar with LEGEND label  
**Auth Check:** Validates @ghxstship.pro email domain

---

### 2. **`(organization)/` - Internal Team Dashboard**
**Access:** Admin/Super Admin roles  
**Purpose:** Event operations, user management, analytics  
**Routes:**
- `/organization/dashboard` - Admin dashboard
- `/organization/dashboard/events` - Event management
- `/organization/dashboard/users` - User management
- `/organization/dashboard/products` - Product management
- `/organization/dashboard/analytics` - Business analytics
- `/organization/dashboard/orders` - Order management
- `/organization/dashboard/reports` - Reporting
- `/organization/analytics` - Advanced analytics

**Layout:** `AdminSidebar` + `AdminHeader`  
**Auth Check:** Validates admin/super_admin role in brand_users table

---

### 3. **`(team)/` - Staff Dashboard**
**Access:** Event staff with team assignments  
**Purpose:** Day-of-show operations, check-ins, scanning  
**Routes:**
- `/team/staff/dashboard` - Staff dashboard
- `/team/staff/scanner` - Ticket scanner
- `/team/staff/issues` - Issue reporting
- `/team/staff/notes` - Quick notes

**Layout:** `DayOfShowLayout`  
**Auth Check:** Validates event_team_assignments record

---

### 4. **`(member)/` - Member Portal**
**Access:** Authenticated end users/subscribers  
**Purpose:** Ticket purchases, orders, benefits, schedule  
**Routes:**
- `/member/dashboard` - Member dashboard
- `/member/orders` - Order history
- `/member/orders/[id]` - Order details
- `/member/advances` - Production advances
- `/member/credits` - Ticket credits
- `/member/vouchers` - Vouchers
- `/member/referrals` - Referral program
- `/member/favorites` - Saved events/artists
- `/member/schedule` - Personal event schedule
- `/member/cart` - Shopping cart
- `/member/checkout` - Checkout flow
- `/member/profile` - User profile
- `/member/membership` - Membership management

**Layout:** `PortalLayout` + `PortalSidebar` (Member Portal)  
**Auth Check:** Validates authenticated user

---

## Other Route Groups

### **`(auth)/` - Authentication**
**Access:** Public  
**Routes:** `/login`, `/signup`, `/reset-password`, `/verify-email`  
**Layout:** Minimal (AuthCardTemplate)

### **`(public)/` - Public Pages**
**Access:** Public  
**Routes:** `/`, `/events`, `/artists`, `/shop`, `/news`, `/membership`  
**Layout:** `SiteHeader` + `SiteFooter`

### **`api/` - API Routes**
**Access:** Varies by endpoint  
**Purpose:** Backend API endpoints

---

## Navigation Hierarchy

```
GVTEWAY
├── Public Site (/)
│   ├── Home
│   ├── Events
│   ├── Artists
│   ├── Shop
│   └── News
│
├── Auth (/login, /signup)
│
├── Legend Dashboard (/legend/dashboard)
│   ├── Events Management
│   ├── Organizations
│   ├── Tasks
│   ├── Budgets
│   ├── Venues
│   ├── Vendors
│   └── Analytics
│
├── Organization Dashboard (/organization/dashboard)
│   ├── Events
│   ├── Users
│   ├── Products
│   ├── Orders
│   ├── Analytics
│   └── Reports
│
├── Team Dashboard (/team/staff)
│   ├── Dashboard
│   ├── Scanner
│   ├── Issues
│   └── Notes
│
└── Member Portal (/member)
    ├── Dashboard
    ├── Orders
    ├── Advances
    ├── Credits
    ├── Vouchers
    ├── Referrals
    ├── Favorites
    ├── Schedule
    ├── Cart
    ├── Checkout
    └── Profile
```

---

## Access Control Flow

### Legend Access
1. User authenticates
2. Check email domain === '@ghxstship.pro'
3. Grant access to `/legend/*`

### Organization Access
1. User authenticates
2. Query `brand_users` table for role
3. Check role in ['admin', 'super_admin']
4. Grant access to `/organization/*`

### Team Access
1. User authenticates
2. Query `event_team_assignments` table
3. Check for active assignment (removed_at IS NULL)
4. Grant access to `/team/*`

### Member Access
1. User authenticates
2. Grant access to `/member/*`

---

## Template/Layout Mapping

| Route Group | Primary Template | Sidebar | Header |
|-------------|-----------------|---------|--------|
| `(legend)` | Custom CSS Modules | Legend Sidebar | None |
| `(organization)` | AdminLayout | AdminSidebar | AdminHeader |
| `(team)` | DayOfShowLayout | None | Embedded |
| `(member)` | PortalLayout | PortalSidebar | None |
| `(public)` | LandingLayout, EventLayout | None | SiteHeader |
| `(auth)` | AuthCardTemplate | None | None |

---

## Design System Compliance

All authenticated pages use:
- **CSS Modules** (no Tailwind utility classes)
- **Design System Tokens** (var(--color-*, --space-*, etc.))
- **GHXSTSHIP Aesthetic** (monochromatic, hard edges, 3px borders, geometric shadows)
- **Logical Properties** (margin-inline-start vs margin-left)

---

## Migration Notes

### Moved Routes
- `/portal/*` → `/legend/dashboard/*` (Legend)
- `/admin/*` → `/organization/dashboard/*` (Organization)
- `/staff/*` → `/team/staff/*` (Team)
- `/advances`, `/credits`, `/orders`, `/vouchers`, `/referrals` → `/member/*` (Member)
- `/cart`, `/checkout`, `/favorites`, `/schedule` → `/member/*` (Member)

### Updated Components
- `PortalSidebar` now uses `/member/*` paths
- Legend dashboard layout uses `/legend/dashboard/*` paths
- All navigation updated to reflect new structure

---

## Benefits of New Structure

1. **Clear RBAC Separation** - Each access level has its own route group
2. **Consistent Layouts** - Each group uses appropriate templates
3. **Better Auth Flow** - Layout-level auth checks prevent unauthorized access
4. **Improved UX** - Users see only relevant navigation for their role
5. **Maintainability** - Easy to find and modify role-specific features
6. **Scalability** - Simple to add new features to specific access levels
