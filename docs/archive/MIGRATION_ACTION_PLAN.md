# GVTEWAY Migration Action Plan

## Summary

Your GVTEWAY (Grasshopper26.00) SQL migrations are **NOT compatible** with the existing shared Supabase database that ATLVS (Dragonfly26.00) is using.

## Key Findings

### ✅ What Was Done
1. Connected to remote Supabase database (`nhceygmzwmhuyqsjxquk.supabase.co`)
2. Analyzed all 18 local migration files
3. Identified 200+ compatibility issues
4. Generated a safe, idempotent migration file

### 🔴 Critical Issues Found

1. **40+ Tables** created without `IF NOT EXISTS`
   - Will fail if table already exists in remote database
   - Example: `events` table already exists from ATLVS

2. **100+ RLS Policies** created without safety checks
   - PostgreSQL doesn't support `CREATE POLICY IF NOT EXISTS`
   - Each duplicate will cause migration failure

3. **80+ Indexes** created without `IF NOT EXISTS`
   - Will fail on duplicate index names

4. **Duplicate Definitions**
   - Several tables defined multiple times across migrations
   - `content_posts`, `media_gallery`, `user_event_schedules` appear in multiple files

## What Needs to Be Done

### Step 1: Review Generated Safe Migration
A new migration file has been created:
```
supabase/migrations/1762653141704_safe_gvteway_consolidated.sql
```

This file consolidates all your migrations with safety checks:
- ✅ `CREATE TABLE IF NOT EXISTS`
- ✅ `CREATE INDEX IF NOT EXISTS`
- ✅ `DROP POLICY IF EXISTS` before `CREATE POLICY`
- ✅ `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`

### Step 2: Backup Current Migrations
```bash
# Create backup of original migrations
mkdir -p supabase/migrations_backup
cp supabase/migrations/202501*.sql supabase/migrations_backup/
```

### Step 3: Test Locally (IMPORTANT!)
```bash
# Start local Supabase
npx supabase start

# Reset and test the safe migration
npx supabase db reset

# Verify tables were created
npx supabase db diff
```

### Step 4: Review Shared vs GVTEWAY-Specific Tables

**Shared with ATLVS** (already exist):
- `events` - Event listings
- `profiles` - User profiles
- `comments` - User comments
- `notifications` - Push notifications

**GVTEWAY-Specific** (need to create):
- `brands` - Multi-brand support
- `brand_admins` - Brand administration
- `artists` - Artist profiles
- `ticket_types` - Ticket categories
- `orders` - E-commerce orders
- `tickets` - Individual tickets
- `products` - Merchandise
- `product_variants` - Product SKUs
- `loyalty_programs` - Loyalty system
- `waitlist` - Waitlist management
- And 30+ more...

### Step 5: Handle Potential Conflicts

#### If `events` table structure differs:
```sql
-- Add missing columns to existing events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_coordinates POINT;
-- etc.
```

#### If policies conflict:
The safe migration already handles this with `DROP POLICY IF EXISTS`.

### Step 6: Apply to Remote Database

**Option A: Use the consolidated safe migration**
```bash
# Move old migrations out of the way
mv supabase/migrations/202501*.sql supabase/migrations_backup/

# Keep only the safe consolidated migration
# Then push to remote
npx supabase db push
```

**Option B: Generate a diff-based migration**
```bash
# This will show exactly what needs to change
npx supabase db diff --linked --schema public -f gvteway_incremental

# Review the generated file, then push
npx supabase db push
```

## Risk Mitigation

### Before Pushing to Production:
1. ✅ **Backup the remote database** (Supabase dashboard → Database → Backups)
2. ✅ **Test locally first** with `npx supabase db reset`
3. ✅ **Review the safe migration file** line by line
4. ✅ **Coordinate with ATLVS team** to ensure no conflicts
5. ✅ **Plan for rollback** if something goes wrong

### During Migration:
- Monitor the migration output for errors
- Be ready to rollback if needed
- Test critical functionality immediately after

### After Migration:
- Verify all GVTEWAY tables exist
- Test ATLVS functionality (ensure nothing broke)
- Check RLS policies are working
- Verify indexes were created

## Files Created

1. **MIGRATION_COMPATIBILITY_REPORT.md** - Detailed analysis
2. **MIGRATION_ACTION_PLAN.md** - This file
3. **supabase/migrations/1762653141704_safe_gvteway_consolidated.sql** - Safe migration
4. **scripts/analyze-migration-compatibility.js** - Analysis tool
5. **scripts/generate-safe-migration.js** - Migration generator
6. **scripts/inspect-remote-schema.js** - Schema inspector

## Recommended Approach

**Use the Safe Consolidated Migration:**

1. Backup original migrations
2. Test the consolidated migration locally
3. Review and adjust if needed
4. Coordinate with ATLVS team
5. Apply to remote database during low-traffic period
6. Monitor and verify

## Alternative: Incremental Approach

If you prefer to add tables incrementally:

1. Create a new migration with only GVTEWAY-specific tables
2. Use `IF NOT EXISTS` for everything
3. Skip tables that ATLVS already created
4. Add columns to existing shared tables as needed

## Questions to Answer

1. **Do you want to share the `events` table with ATLVS or create a separate one?**
   - Shared: Add `brand_id` column to distinguish GVTEWAY events
   - Separate: Rename to `gvteway_events`

2. **Which tables should be shared between ATLVS and GVTEWAY?**
   - `profiles` (users)
   - `notifications`
   - `events`
   - Others?

3. **Do you need to modify any existing ATLVS tables?**
   - Add columns?
   - Add indexes?
   - Add policies?

## Next Steps

1. Review `MIGRATION_COMPATIBILITY_REPORT.md`
2. Review the generated safe migration file
3. Decide on shared vs separate table strategy
4. Test locally
5. Coordinate with ATLVS team
6. Apply to remote database

---

**Status**: ⚠️ **DO NOT APPLY ORIGINAL MIGRATIONS TO REMOTE DATABASE**

The original migrations will fail. Use the safe consolidated migration or create a new incremental migration.
