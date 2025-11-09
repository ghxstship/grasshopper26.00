# GVTEWAY Database Migrations

## Quick Start

The GVTEWAY migrations are ready to deploy to the shared Supabase database.

### Apply to Remote Database

```bash
# Option 1: Push migrations (requires migration repair first)
npx supabase db push --linked

# Option 2: Apply manually via SQL
# See MIGRATION_EXECUTION_COMPLETE.md for details
```

## Migration Files (17 total)

All migrations are numbered sequentially and include safety checks (`IF NOT EXISTS`, `DROP IF EXISTS`):

1. **00001_initial_schema.sql** - Core schema (brands, events, artists, tickets, products, etc.)
2. **00002_add_inventory_function.sql** - Inventory management functions
3. **00003_add_enums.sql** - Type-safe enums for status fields
4. **00004_missing_tables.sql** - Additional tables and column additions
5. **00005_add_audit_trail.sql** - Audit logging system
6. **00006_add_check_constraints.sql** - Data validation constraints
7. **00007_add_loyalty_program.sql** - Loyalty points and rewards
8. **00008_add_notifications.sql** - Push notification system
9. **00009_add_soft_delete.sql** - Soft delete functionality
10. **00010_add_reporting_views.sql** - Analytics materialized views
11. **00011_add_search_optimization.sql** - Full-text search with vectors
12. **00012_add_waitlist.sql** - Event waitlist system
13. **00013_inventory_functions.sql** - Advanced inventory functions
14. **00014_search_functions.sql** - Universal search function
15. **00015_ticket_addons.sql** - Ticket add-ons and upgrades
16. **00016_venue_maps.sql** - Interactive venue mapping
17. **00018_seed_data.sql** - Sample data for development

## Shared Database Architecture

GVTEWAY shares a Supabase database with ATLVS (Dragonfly26.00):

**Shared Tables:**
- `events` - Event listings
- `profiles` - User profiles (from auth.users)
- `comments` - User comments
- `notifications` - Push notifications

**GVTEWAY-Specific Tables:**
- `brands` - Multi-brand support
- `artists` - Artist profiles
- `ticket_types` - Ticket categories
- `orders` - E-commerce orders
- `products` - Merchandise
- `loyalty_programs` - Loyalty system
- And 30+ more...

## Safety Features

All migrations include:
- ✅ `CREATE TABLE IF NOT EXISTS`
- ✅ `CREATE INDEX IF NOT EXISTS`
- ✅ `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
- ✅ `DROP FUNCTION IF EXISTS` before `CREATE FUNCTION`
- ✅ `DROP POLICY IF EXISTS` before `CREATE POLICY`
- ✅ `ALTER TABLE ADD COLUMN IF NOT EXISTS`

## Testing

Migrations have been tested locally and apply successfully without errors.

## Documentation

- **MIGRATION_COMPATIBILITY_REPORT.md** - Detailed analysis of compatibility issues
- **MIGRATION_ACTION_PLAN.md** - Step-by-step deployment guide
- **MIGRATION_EXECUTION_COMPLETE.md** - Execution summary and results

## Environment Variables

Required in `.env.local` and Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nhceygmzwmhuyqsjxquk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Status

**✅ READY FOR DEPLOYMENT**

All migrations are tested, validated, and safe to apply to the production database.
