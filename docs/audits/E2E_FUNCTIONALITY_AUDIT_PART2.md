# End-to-End Functionality Audit - Part 2: API Routes & Workflows
**GVTEWAY (Grasshopper 26.00) - Complete System Audit**  
**Date:** January 15, 2025  
**Status:** AUDIT ONLY - No Remediations Implemented

---

## 3. API ROUTES INVENTORY (77 Total Endpoints)

### 3.1 Authentication Routes (`/api/auth/`) - 10 endpoints
| Endpoint | Method | Auth Required | Function | RLS Check |
|----------|--------|---------------|----------|-----------|
| `/api/auth/login` | POST | No | Email/password login | Public |
| `/api/auth/register` | POST | No | User registration | Public |
| `/api/auth/reset-password` | POST | No | Password reset request | Public |
| `/api/auth/update-password` | POST | Yes | Update password | `auth.uid()` |
| `/api/auth/change-password` | POST | Yes | Change password | `auth.uid()` |
| `/api/auth/verify-email` | GET | No | Email verification | Public |
| `/api/auth/resend-verification` | POST | Yes | Resend verification email | `auth.uid()` |
| `/api/auth/user` | GET | Yes | Get current user | `auth.uid()` |
| `/api/auth/bluesky` | GET | No | Bluesky OAuth initiation | Public |
| `/api/auth/bluesky/callback` | GET | No | Bluesky OAuth callback | Public |

### 3.2 Admin Routes (`/api/admin/`) - 31 endpoints
**All require team member authentication with appropriate permissions**

#### Events (11 endpoints)
- `GET /api/admin/events` - List events | `can_manage_brand()` or `is_super_admin()`
- `POST /api/admin/events` - Create event | `is_super_admin()` or `can_manage_brand()`
- `GET /api/admin/events/[id]` - Get event | `can_manage_event()`
- `PUT /api/admin/events/[id]` - Update event | `can_manage_event()`
- `DELETE /api/admin/events/[id]` - Delete event | `can_manage_event()`
- `GET /api/admin/events/[id]/artists` - List event artists | `can_manage_event()`
- `POST /api/admin/events/[id]/artists` - Add artist to event | `can_manage_event()`
- `GET /api/admin/events/[id]/schedule` - Get schedule | `can_manage_event()`
- `POST /api/admin/events/[id]/schedule` - Create schedule item | `can_manage_event()`
- `GET /api/admin/events/[id]/stages` - List stages | `can_manage_event()`
- `POST /api/admin/events/[id]/stages` - Create stage | `can_manage_event()`

#### Credentials (5 endpoints)
- `GET /api/admin/events/[id]/credentials` - List credentials | `event_role = 'event_lead'`
- `POST /api/admin/events/[id]/credentials` - Issue credential | `event_role = 'event_lead'`
- `GET /api/admin/events/[id]/credentials/[credentialId]` - Get credential | `event_role = 'event_lead'`
- `PUT /api/admin/events/[id]/credentials/[credentialId]` - Update credential | `event_role = 'event_lead'`
- `POST /api/admin/events/[id]/credentials/[credentialId]/check-in` - Check-in credential | `event_role IN ('event_lead', 'event_staff')`

#### Products & Orders (5 endpoints)
- `GET /api/admin/products` - List products | `is_team_member()`
- `POST /api/admin/products` - Create product | `can_manage_brand()`
- `GET /api/admin/products/[id]` - Get product | `is_team_member()`
- `PUT /api/admin/products/[id]` - Update product | `can_manage_brand()`
- `POST /api/admin/orders/[id]/refund` - Refund order | `can_manage_event()`

#### Users & Analytics (6 endpoints)
- `GET /api/admin/users` - List users | `is_super_admin()`
- `POST /api/admin/users` - Create user | `is_super_admin()`
- `GET /api/admin/users/[id]` - Get user | `is_super_admin()`
- `PUT /api/admin/users/[id]` - Update user | `is_super_admin()`
- `GET /api/admin/analytics` - Get analytics | `is_team_member()`
- `GET /api/admin/reports/sales` - Sales report | `can_manage_event()`

#### Other Admin (4 endpoints)
- `GET /api/admin/artists` - List artists | `is_team_member()`
- `POST /api/admin/artists` - Create artist | `can_manage_brand()`
- `GET /api/admin/advances` - List advances | `event_role = 'event_lead'`
- `POST /api/admin/advances/[id]/approve` - Approve advance | `event_role = 'event_lead'`

### 3.3 Member/Portal Routes (`/api/`) - 18 endpoints

#### Production Advances (5 endpoints)
- `GET /api/advances` - List user's advances | `auth.uid() = submitter_user_id`
- `POST /api/advances` - Create advance | `auth.uid()`
- `GET /api/advances/[id]` - Get advance | `auth.uid() = submitter_user_id`
- `PUT /api/advances/[id]` - Update advance | `auth.uid() = submitter_user_id AND status = 'draft'`
- `POST /api/advances/[id]/comments` - Add comment | `auth.uid() = submitter_user_id`

#### Catalog (3 endpoints)
- `GET /api/catalog/categories` - List categories | Public
- `GET /api/catalog/items` - List items | Public
- `GET /api/catalog/items/[id]` - Get item | Public

#### Checkout & Orders (3 endpoints)
- `POST /api/checkout/create-session` - Create Stripe session | `auth.uid()`
- `POST /api/checkout/verify-session` - Verify session | `auth.uid()`
- `GET /api/orders` - List user orders | `auth.uid() = user_id`

#### Other Member (7 endpoints)
- `GET /api/favorites` - List favorites | `auth.uid()`
- `POST /api/favorites` - Add favorite | `auth.uid()`
- `GET /api/loyalty/points` - Get points | `auth.uid()`
- `GET /api/memberships/companion-passes` - List passes | `auth.uid()`
- `GET /api/notifications` - List notifications | `auth.uid()`
- `GET /api/users/profile` - Get profile | `auth.uid()`
- `PUT /api/users/profile` - Update profile | `auth.uid()`

### 3.4 V1 API Routes (`/api/v1/`) - 18 endpoints
**Versioned API for external integrations**

- `GET /api/v1/analytics` - Analytics data | `is_team_member()`
- `GET /api/v1/artists` - List artists | Public
- `POST /api/v1/artists` - Create artist | `can_manage_brand()`
- `GET /api/v1/events` - List events | Public
- `POST /api/v1/events` - Create event | `can_manage_brand()`
- `GET /api/v1/orders` - List orders | `auth.uid()` or `is_team_member()`
- `POST /api/v1/orders` - Create order | `auth.uid()`
- `GET /api/v1/products` - List products | Public
- `POST /api/v1/products` - Create product | `can_manage_brand()`
- `POST /api/v1/tickets/scan` - Scan ticket | `event_role IN ('event_lead', 'event_staff')`
- `POST /api/v1/tickets/validate` - Validate ticket | `event_role IN ('event_lead', 'event_staff')`
- `POST /api/v1/check-in` - Check-in attendee | `event_role IN ('event_lead', 'event_staff')`
- `GET /api/v1/search` - Global search | Public
- `GET /api/v1/staff` - List staff | `is_team_member()`
- `GET /api/v1/venues` - List venues | Public
- `GET /api/v1/notifications` - List notifications | `auth.uid()`
- `GET /api/v1/messages` - List messages | `auth.uid()`
- `POST /api/v1/batch/check-in` - Batch check-in | `event_role = 'event_lead'`

---

## 4. USER WORKFLOWS BY ROLE

### 4.1 LEGEND (Platform Owner) Workflows

#### Complete System Access
**Authentication Flow:**
```
Login → Middleware checks user_profiles.team_role = 'legend' 
→ All RLS policies bypass with is_legend(auth.uid()) 
→ Redirect to / (Legend dashboard)
```

**Key Workflows:**
1. **User Management**
   - Pages: `/organizations`, `/staff`
   - API: `GET/POST/PUT/DELETE /api/admin/users`
   - Data: `user_profiles`, `brand_team_assignments`, `event_team_assignments`
   - Flow: List users → Edit roles → Assign to brands/events → Save

2. **Brand Management**
   - Pages: `/organizations`, `/organizations/new`
   - API: `GET/POST/PUT /api/admin/brands`
   - Data: `brands`, `brand_team_assignments`, `brand_integrations`
   - Flow: Create brand → Configure settings → Assign admins → Setup Stripe

3. **Venue Management**
   - Pages: `/venues`, `/venues/[id]`
   - API: `GET/POST /api/admin/venues`
   - Data: `venues`, `venue_maps`
   - Flow: Add venue → Upload maps → Configure capacity → Publish

4. **System Configuration**
   - Pages: `/settings`
   - API: Direct database access
   - Data: `rbac_permissions`, `rbac_role_permissions`
   - Flow: Modify permissions → Update role mappings → Test access

### 4.2 SUPER ADMIN (Organization Admin) Workflows

#### Organization-Level Management
**Authentication Flow:**
```
Login → Middleware checks user_profiles.team_role = 'super_admin' 
→ RLS checks is_super_admin(auth.uid()) or can_manage_brand(auth.uid(), brand_id)
→ Redirect to /organization
```

**Key Workflows:**
1. **Event Creation**
   - Pages: `/organization/events/create`, `/organization/events/new`
   - API: `POST /api/admin/events`
   - Data: `events`, `event_stages`, `ticket_types`
   - Flow: Fill event form → Add stages → Create ticket types → Publish
   - Backend: `INSERT INTO events` → `INSERT INTO event_stages` → `INSERT INTO ticket_types`

2. **Team Assignment**
   - Pages: `/organization/users`, `/organization/roles`
   - API: `POST /api/admin/brand-team-assignments`
   - Data: `brand_team_assignments`, `user_profiles`
   - Flow: Select user → Assign role → Set permissions → Save
   - Backend: `INSERT INTO brand_team_assignments` → Update `user_profiles.team_role`

3. **Financial Reports**
   - Pages: `/organization/reports`
   - API: `GET /api/admin/reports/sales`
   - Data: `orders`, `tickets`, `products`
   - Flow: Select date range → Generate report → Export CSV
   - Backend: Aggregate queries on orders/tickets → Format data → Return JSON

4. **Integration Management**
   - Pages: `/organization/settings`
   - API: `PUT /api/admin/brand-integrations`
   - Data: `brand_integrations`
   - Flow: Connect Stripe → Configure webhooks → Test connection
   - Backend: Store Stripe keys → Create webhook endpoints → Verify

### 4.3 ADMIN (Event Administrator) Workflows

#### Event-Level Management
**Authentication Flow:**
```
Login → Middleware checks user_profiles.team_role = 'admin'
→ RLS checks can_manage_event(auth.uid(), event_id)
→ Redirect to /organization/events
```

**Key Workflows:**
1. **Event Configuration**
   - Pages: `/organization/events/[id]/edit`
   - API: `GET/PUT /api/admin/events/[id]`
   - Data: `events`
   - Flow: Load event → Edit details → Upload images → Save
   - Backend: `SELECT * FROM events WHERE id = ?` → `UPDATE events SET ...`

2. **Artist Lineup Management**
   - Pages: `/organization/events/[id]/artists`
   - API: `GET /api/admin/events/[id]/artists`, `POST /api/admin/events/[id]/artists`
   - Data: `event_artists`, `artists`
   - Flow: Search artists → Add to lineup → Set headliner → Reorder → Save
   - Backend: `INSERT INTO event_artists` → Update `performance_order`

3. **Schedule Creation**
   - Pages: `/organization/events/[id]/schedule`
   - API: `GET/POST /api/admin/events/[id]/schedule`
   - Data: `event_schedule`, `event_stages`, `artists`
   - Flow: Select stage → Select artist → Set time → Add notes → Save
   - Backend: `INSERT INTO event_schedule` → Validate no conflicts

4. **Ticket Type Management**
   - Pages: `/organization/events/[id]/tickets`
   - API: `GET/POST /api/admin/events/[id]/ticket-types`
   - Data: `ticket_types`
   - Flow: Create tier → Set price → Set quantity → Configure perks → Save
   - Backend: `INSERT INTO ticket_types` → Create Stripe price → Store price_id

5. **Team Assignment**
   - Pages: `/organization/events/[id]/team`
   - API: `GET/POST /api/admin/event-team-assignments`
   - Data: `event_team_assignments`
   - Flow: Invite user → Select role → Set permissions → Send invitation
   - Backend: `INSERT INTO event_team_assignments` → Generate invitation token → Send email

6. **Vendor Coordination**
   - Pages: `/organization/events/[id]/vendors`
   - API: `GET/POST /api/admin/event-vendors`
   - Data: `event_vendors`
   - Flow: Add vendor → Set load-in time → Assign area → Track status
   - Backend: `INSERT INTO event_vendors` → Send vendor invitation

7. **Credential Issuance**
   - Pages: `/organization/events/[id]/credentials`, `/organization/events/[id]/credentials/issue`
   - API: `GET/POST /api/admin/events/[id]/credentials`
   - Data: `event_credentials`, `event_team_assignments`
   - Flow: Select credential type → Enter holder info → Set access → Issue → Print
   - Backend: `INSERT INTO event_credentials` → Generate credential number → Create badge

8. **Check-In Operations**
   - Pages: `/organization/events/[id]/check-in`
   - API: `POST /api/v1/check-in`, `POST /api/v1/tickets/scan`
   - Data: `tickets`, `orders`
   - Flow: Scan QR code → Validate ticket → Mark as used → Update capacity
   - Backend: `UPDATE tickets SET status = 'used', scanned_at = NOW()` → Increment capacity

9. **Production Advance Approval**
   - Pages: `/organization/advances`
   - API: `GET /api/admin/advances`, `POST /api/admin/advances/[id]/approve`
   - Data: `production_advances`, `production_advance_items`
   - Flow: Review advance → Check availability → Approve/reject → Assign units
   - Backend: `UPDATE production_advances SET status = 'approved'` → `INSERT INTO advance_item_unit_assignments`

### 4.4 MEMBER (Subscribed Member) Workflows

#### Full Member Experience
**Authentication Flow:**
```
Login → Middleware checks user_profiles.member_role = 'member'
→ RLS checks has_active_membership(auth.uid())
→ Redirect to /member/portal
```

**Key Workflows:**
1. **Event Discovery & Ticket Purchase**
   - Pages: `/events`, `/events/[slug]`, `/member/portal/cart`, `/member/portal/checkout`
   - API: `GET /api/v1/events`, `POST /api/checkout/create-session`
   - Data: `events`, `ticket_types`, `orders`, `tickets`
   - Flow: Browse events → Select event → Add tickets to cart → Checkout → Payment → Confirmation
   - Backend: Create Stripe session → Process payment → `INSERT INTO orders` → `INSERT INTO tickets` → Generate QR codes → Send email

2. **Production Advance Request**
   - Pages: `/member/portal/advances/catalog`, `/member/portal/advances/checkout`, `/member/portal/advances/[id]`
   - API: `GET /api/catalog/items`, `POST /api/advances`
   - Data: `catalog_items`, `production_advances`, `production_advance_items`
   - Flow: Browse catalog → Add items to cart → Fill request form → Submit → Track status
   - Backend: `INSERT INTO production_advances` → `INSERT INTO production_advance_items` → Generate advance number → Notify admins
   - Context: Uses `AdvanceCartContext` for cart state management (localStorage persistence)

3. **Credit Management**
   - Pages: `/member/portal/credits`
   - API: `GET /api/loyalty/points`
   - Data: `ticket_credits_ledger`, `user_memberships`
   - Flow: View balance → View transactions → Redeem credits
   - Backend: `SELECT * FROM ticket_credits_ledger WHERE membership_id = ?` → Calculate balance

4. **VIP Upgrade Redemption**
   - Pages: `/member/portal/vouchers`
   - API: `GET /api/memberships/vip-vouchers`
   - Data: `vip_upgrade_vouchers`
   - Flow: View vouchers → Select event → Redeem → Upgrade ticket
   - Backend: `UPDATE vip_upgrade_vouchers SET status = 'redeemed'` → Upgrade ticket tier

5. **Personal Schedule Builder**
   - Pages: `/member/portal/schedule`
   - API: `GET/POST /api/user-event-schedules`
   - Data: `user_event_schedules`, `event_schedule`
   - Flow: View event schedule → Add sets to personal schedule → Share schedule
   - Backend: `INSERT INTO user_event_schedules` → Store schedule_items JSONB

6. **Order Management**
   - Pages: `/member/portal/orders`, `/member/portal/orders/[id]`, `/member/portal/orders/[id]/tickets`
   - API: `GET /api/orders`, `GET /api/orders/[id]`
   - Data: `orders`, `tickets`
   - Flow: View orders → View tickets → Download QR codes → Transfer tickets
   - Backend: `SELECT * FROM orders WHERE user_id = auth.uid()` → `SELECT * FROM tickets WHERE order_id = ?`

### 4.5 EVENT STAFF (On-Site Operations) Workflows

#### Check-In Operations
**Authentication Flow:**
```
Login → Check event_team_assignments.event_role_type = 'event_staff'
→ RLS checks has_event_permission(auth.uid(), event_id, 'can_scan_tickets')
→ Redirect to /team/staff/dashboard
```

**Key Workflows:**
1. **Ticket Scanning**
   - Pages: `/organization/events/[id]/check-in`
   - API: `POST /api/v1/tickets/scan`, `POST /api/v1/tickets/validate`
   - Data: `tickets`, `orders`
   - Flow: Scan QR code → Validate ticket → Mark as used → Display confirmation
   - Backend: Decode QR → `SELECT * FROM tickets WHERE qr_code = ?` → Validate status → `UPDATE tickets SET status = 'used', scanned_at = NOW()`

2. **Capacity Monitoring**
   - Pages: `/organization/events/[id]/check-in`
   - API: `GET /api/v1/events/[id]/capacity`
   - Data: `tickets`, `events`
   - Flow: View real-time capacity → Monitor check-ins → Alert when near capacity
   - Backend: `SELECT COUNT(*) FROM tickets WHERE status = 'used'` → Compare to event.capacity

3. **Will-Call Handling**
   - Pages: `/organization/events/[id]/check-in`
   - API: `GET /api/v1/orders`, `POST /api/v1/tickets/validate`
   - Data: `orders`, `tickets`
   - Flow: Search by name/email → Verify ID → Mark as picked up → Issue ticket
   - Backend: `SELECT * FROM orders WHERE attendee_email = ?` → `UPDATE tickets SET status = 'active'`

---

**Continue to Part 3 for Interactive Elements, Data Flows, and Findings**
