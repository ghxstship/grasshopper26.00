# Database Quick Start Guide

Quick reference for common database operations and new features.

---

## 🚀 Connection Pooling

### When to Use Pooled Connections

**Use pooled client for:**
- API routes
- Server actions
- Background jobs
- Cron jobs
- High-traffic endpoints

**Use regular client for:**
- Browser/client-side operations
- User session management
- Real-time subscriptions

### Usage

```typescript
// Server-side with pooling
import { createPooledClient } from '@/lib/supabase/pool'

export async function GET() {
  const supabase = createPooledClient()
  const { data, error } = await supabase.from('events').select('*')
  return Response.json({ data, error })
}

// Client-side (no pooling)
import { createClient } from '@/lib/supabase/client'

export default function Component() {
  const supabase = createClient()
  // ... use supabase
}
```

---

## 📊 Database Indexes

### Migration 00020

**Status:** Ready to deploy  
**Indexes Added:** 100+  
**Expected Performance Gain:** 50-80% faster queries

### Deployment

```bash
# Review migration
cat supabase/migrations/00020_add_missing_indexes.sql

# Apply to production (during maintenance window)
supabase db push --linked

# Verify indexes created
supabase db remote --linked
\di
```

### Post-Deployment

```sql
-- Update statistics
ANALYZE brands;
ANALYZE events;
ANALYZE orders;
-- ... etc

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 💾 Backups

### Automated Backups

**Supabase Daily Backups:**
- Frequency: Daily at 2:00 AM UTC
- Retention: 7-30 days
- Access: Supabase Dashboard → Database → Backups

**GitHub Actions Backups:**
- Frequency: Every 6 hours
- Retention: 30 days local, 90 days S3
- Access: GitHub Actions artifacts

### Manual Backup

```bash
# Run backup script
./scripts/backup-database.sh

# Backup location
ls -lh backups/supabase/daily/
```

### Restore from Backup

```bash
# List available backups
supabase db list-backups --linked

# Restore from Supabase backup
supabase db restore --backup-id <backup-id> --linked

# Restore from local backup
gunzip backup_20250109_143000.sql.gz
psql "$DATABASE_URL" < backup_20250109_143000.sql
```

### Point-in-Time Recovery

```bash
# Restore to specific timestamp
supabase db restore --pitr-timestamp "2025-01-09T10:30:00Z" --linked
```

---

## 🔍 Query Optimization Tips

### Use Indexed Columns in WHERE Clauses

```sql
-- ✅ Good - uses index
SELECT * FROM events WHERE brand_id = '...' AND status = 'upcoming';

-- ❌ Bad - no index on computed column
SELECT * FROM events WHERE LOWER(name) = 'event name';
```

### Leverage Composite Indexes

```sql
-- ✅ Good - uses composite index
SELECT * FROM orders WHERE user_id = '...' AND status = 'completed';

-- ✅ Good - uses composite index
SELECT * FROM notifications WHERE user_id = '...' AND read = false;
```

### Use Partial Indexes for Filtered Queries

```sql
-- ✅ Good - uses partial index
SELECT * FROM events WHERE status IN ('upcoming', 'on_sale') ORDER BY start_date;

-- ✅ Good - uses partial index
SELECT * FROM notifications WHERE user_id = '...' AND read = false;
```

### JSONB and Array Searches

```sql
-- ✅ Good - uses GIN index
SELECT * FROM artists WHERE 'electronic' = ANY(genre_tags);

-- ✅ Good - uses GIN index
SELECT * FROM events WHERE metadata @> '{"featured": true}';
```

---

## 🔧 Troubleshooting

### Connection Pool Issues

```typescript
// Check pool stats (when implemented)
import { getPoolStats } from '@/lib/supabase/pool'

const stats = await getPoolStats()
console.log('Active connections:', stats?.activeConnections)
```

### Slow Queries

```sql
-- Enable slow query logging
ALTER DATABASE postgres SET log_min_duration_statement = 1000; -- 1 second

-- View slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Index Usage

```sql
-- Check if indexes are being used
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;
```

---

## 📚 Additional Resources

- [Backup Strategy](./BACKUP_STRATEGY.md)
- [Data Access Layer Remediation](./DATA_ACCESS_LAYER_REMEDIATION.md)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

**Last Updated:** 2025-01-09  
**Maintained By:** DevOps Team
