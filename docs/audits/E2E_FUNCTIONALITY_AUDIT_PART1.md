# End-to-End Functionality Audit - Part 1: Roles & Database
**GVTEWAY (Grasshopper 26.00) - Complete System Audit**  
**Date:** January 15, 2025  
**Status:** AUDIT ONLY - No Remediations Implemented

---

## Executive Summary

This audit documents 100% of user roles, workflows, interactive elements, and full-stack data flows across the GVTEWAY platform. The system implements a sophisticated multi-tenant event management platform with enterprise RBAC, production advancing, membership tiers, and comprehensive event operations.

### System Overview
- **Database:** PostgreSQL (Supabase) with 57+ migrations
- **Authentication:** Supabase Auth with Row Level Security (RLS)
- **Frontend:** Next.js 14 (App Router) with Server/Client Components
- **API:** 45+ REST endpoints + 32 v1 API routes
- **User Roles:** 8 Team Roles + 4 Member Roles + 9 Event-Specific Roles + 3 Credential Roles
- **Total Pages:** 100+ authenticated pages across 4 route groups

---

## 1. USER ROLES & PERMISSIONS INVENTORY

### 1.1 Team Roles (Internal/Staff)
**Enum:** `team_role` (migration 00021)

| Role | Level | Access Scope | Primary Functions |
|------|-------|--------------|-------------------|
| **legend** | 0 (God Mode) | Platform-wide | All permissions, system configuration, user management |
| **super_admin** | 1 | Organization | Brand management, organization settings, all events |
| **admin** | 2 | Event Level | Event creation/management, team assignments, analytics |
| **lead** | 3 | Department | Department operations, team coordination, reporting |
| **team** | 4 | Event Access | Event operations, check-in, ticket scanning |
| **collaborator** | 5 | Limited | Content management, assigned tasks only |
| **partner** | 6 | Read-Only | Analytics viewing, stakeholder reports |
| **ambassador** | 7 | Brand Rep | Brand promotion, limited content access |

**Database Tables:**
- `user_profiles.team_role` - Role assignment
- `user_profiles.is_team_member` - Team member flag
- `brand_team_assignments` - Brand-level team assignments
- `event_team_assignments` - Event-specific team assignments

### 1.2 Member Roles (Customer-Facing)
**Enum:** `member_role` (migration 00021)

| Role | Access Level | Capabilities | Restrictions |
|------|--------------|--------------|--------------|
| **member** | Full | All features, content creation, purchases, credits | None |
| **trial_member** | Limited | Read-only, browse events, limited features | No purchases, no content creation |
| **attendee** | Event-Specific | Single event access, basic features | Event-scoped only |
| **guest** | Minimal | Guest list access, view-only | No purchases, no profile |

**Database Tables:**
- `user_profiles.member_role` - Member tier assignment
- `user_memberships` - Active membership records
- `membership_tiers` - Tier definitions (Community, Basic, Main, Extra, Business, First Class)

### 1.3 Event-Specific Roles
**Enum:** `event_role_type` (migration 00034)

| Role | Badge Color | Permissions | Use Case |
|------|-------------|-------------|----------|
| **event_lead** | Purple (#8B5CF6) | Full event management, team assignment, financials | Event coordinator |
| **event_staff** | Green (#10B981) | Check-in, ticket scanning, capacity monitoring | On-site operations |
| **vendor** | Orange (#F59E0B) | Schedule access, content upload, vendor info | Event vendors |
| **talent** | Pink (#EC4899) | Schedule, rider, media upload, hospitality | Performing artists |
| **agent** | Indigo (#6366F1) | Contracts, payment schedule, production comms | Talent representatives |
| **sponsor** | Blue (#3B82F6) | Analytics, demographics, engagement reports | Event sponsors |
| **media** | Red (#EF4444) | Schedule, media download, press kit, media area | Press/Media |
| **investor** | Emerald (#059669) | Financials, analytics, revenue, ROI | Financial investors |
| **stakeholder** | Gray (#6B7280) | Read-only, schedule, basic analytics | General stakeholders |

**Database Tables:**
- `event_role_definitions` - Role definitions with permissions
- `event_team_assignments.event_role_type` - Role assignment
- `event_role_permission_usage` - Permission usage tracking

### 1.4 Credential Roles (Physical Access)
**Added in:** migration 00031

| Credential | Badge Color | Access Level | Typical Users |
|------------|-------------|--------------|---------------|
| **AAA** | Red | All-access (backstage, production, VIP, stage) | Headliners, tour managers, key production |
| **AA** | Yellow | High-level (backstage, production, stage) | Supporting artists, management, crew |
| **Production** | Blue | Technical (stage, equipment, loading dock) | Audio/lighting techs, stage hands |

**Database Tables:**
- `event_credentials` - Credential issuance and tracking
- `event_team_role_templates` - Credential templates with access permissions

---

## 2. DATABASE SCHEMA AUDIT

### 2.1 Core Tables (57 Total)

#### Authentication & Users (4 tables)
- `auth.users` - Supabase authentication
- `user_profiles` - Extended profiles with role assignments
- `user_favorite_artists` - Artist favorites
- `user_event_schedules` - Personal event schedules

#### Multi-Tenancy (4 tables)
- `brands` - Organization/brand records
- `brand_admins` - Brand administrators (deprecated)
- `brand_team_assignments` - Brand-level team members
- `brand_integrations` - External integrations

#### Events (8 tables)
- `events` - Event records
- `event_stages` - Event stages/venues
- `event_schedule` - Set times/schedule
- `event_artists` - Artist-to-event relationships
- `event_team_assignments` - Event team members
- `event_vendors` - Vendor management
- `event_credentials` - Access credentials/badges
- `event_team_role_templates` - Role templates

#### Ticketing (4 tables)
- `ticket_types` - Ticket tier definitions
- `orders` - Purchase orders
- `tickets` - Individual tickets with QR codes
- `ticket_addons` - Ticket add-ons/upgrades

#### Products & Merchandise (3 tables)
- `products` - Product catalog
- `product_variants` - SKUs and variants
- `physical_units` - Equipment inventory tracking

#### Content (3 tables)
- `content_posts` - Blog/news articles
- `media_gallery` - Photo/video gallery
- `artists` - Artist profiles

#### Membership System (10 tables)
- `membership_tiers` - Tier definitions (6 tiers)
- `user_memberships` - Active memberships
- `membership_benefit_usage` - Benefit redemption tracking
- `membership_transitions` - Upgrade/downgrade history
- `business_team_members` - Business tier sub-accounts
- `ticket_credits_ledger` - Credit transactions
- `vip_upgrade_vouchers` - VIP upgrade vouchers
- `member_events` - Member-only events
- `member_event_registrations` - Event registrations
- `membership_referrals` - Referral program

#### Production Advancing System (10 tables)
- `catalog_categories` - ATLVS master catalog categories
- `catalog_items` - Catalog items (equipment, access, services)
- `catalog_item_modifiers` - Item modifiers/add-ons
- `catalog_modifier_options` - Modifier options
- `production_advances` - Advance requests
- `production_advance_items` - Advance line items
- `production_advance_status_history` - Status audit trail
- `production_advance_comments` - Communication thread
- `advance_templates` - Reusable templates
- `advance_item_unit_assignments` - Physical unit assignments

#### RBAC System (7 tables)
- `rbac_resources` - Protected resources
- `rbac_permissions` - Permission definitions
- `rbac_role_permissions` - Role-to-permission mappings
- `rbac_user_permissions` - User-specific overrides
- `rbac_audit_log` - Permission change audit trail
- `event_role_definitions` - Event role definitions
- `event_role_permission_usage` - Permission usage analytics

#### Additional Systems (4 tables)
- `departments` - Department structure
- `venues` - Venue catalog
- `venue_maps` - Interactive venue maps
- `waitlist` - Event waitlist

### 2.2 Row Level Security (RLS) Status
**All 57 tables have RLS enabled** with policies based on:
- User authentication (`auth.uid()`)
- Role-based permissions (`is_legend()`, `is_super_admin()`, `is_team_member()`)
- Event-specific access (`has_active_event_assignment()`, `can_manage_event()`)
- Brand-specific access (`can_manage_brand()`)
- Membership status (`has_active_membership()`)
- Ticket ownership (`has_event_ticket()`)

### 2.3 Helper Functions (20+)
- `is_legend(user_id)` - Check platform owner status
- `is_super_admin(user_id)` - Check super admin status
- `is_team_member(user_id)` - Check team member status
- `has_permission(user_id, resource, action, scope)` - Check specific permission
- `can_manage_event(user_id, event_id)` - Check event management access
- `can_manage_brand(user_id, brand_id)` - Check brand management access
- `has_active_membership(user_id)` - Check active membership
- `has_event_ticket(user_id, event_id)` - Check ticket ownership
- `get_user_event_role(user_id, event_id)` - Get event-specific role
- `has_event_permission(user_id, event_id, permission)` - Check event permission
- `get_user_event_permissions(user_id, event_id)` - Get all event permissions
- `log_event_permission_usage()` - Log permission usage
- `generate_advance_number()` - Generate unique advance numbers
- `update_inventory_on_order()` - Update inventory after order
- `check_inventory_availability()` - Check stock availability

---

**Continue to Part 2 for API Routes, Workflows, and Interactive Elements**
