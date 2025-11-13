-- Reset migration history for renumbered migrations
-- This removes the old migration records so we can apply the renumbered ones

DELETE FROM supabase_migrations.schema_migrations 
WHERE version IN (
  '00041', '00042', '00043', '00044', '00045', 
  '00046', '00047', '00048', '00049', '00050',
  '00051', '00052', '00053', '00054', '00055',
  '00056', '00057', '00058', '00059', '00060'
);

-- Verify what's left
SELECT version, name FROM supabase_migrations.schema_migrations 
ORDER BY version;
