# Migration Reset Instructions

## Problem
We renumbered local migrations 00041-00060 to 00039-00059, but the remote database already has the OLD 00041-00060 applied.

## Solution
Execute this SQL in the Supabase SQL Editor to reset the migration history:

### Step 1: Go to Supabase Dashboard
https://supabase.com/dashboard/project/zunesxhsexrqjrroeass/sql/new

### Step 2: Execute this SQL

```sql
-- Delete the old migration records (00039-00060)
DELETE FROM supabase_migrations.schema_migrations 
WHERE version >= '00039';

-- Verify deletion
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC
LIMIT 10;
```

### Step 3: Push the renumbered migrations
After executing the SQL above, run:

```bash
npx supabase db push
```

This will apply migrations 00039-00059 with the new content.

## What This Does
- Removes migration records for versions 00039-00060 from the history table
- Allows the renumbered migrations (00039-00059) to be applied
- Eliminates gaps in the migration sequence
- No data loss - only migration history is affected
