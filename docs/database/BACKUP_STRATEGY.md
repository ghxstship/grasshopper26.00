# Database Backup & Disaster Recovery Strategy

## Overview

This document outlines the comprehensive backup and disaster recovery strategy for GVTEWAY's Supabase database infrastructure. The strategy ensures data integrity, business continuity, and compliance with enterprise standards.

---

## 🎯 Backup Objectives

### Recovery Point Objective (RPO)
- **Target:** < 1 hour
- **Maximum acceptable data loss:** 1 hour of transactions

### Recovery Time Objective (RTO)
- **Target:** < 4 hours
- **Maximum acceptable downtime:** 4 hours for full restoration

---

## 📊 Backup Types & Schedule

### 1. Automatic Supabase Backups

Supabase provides automated daily backups on Pro tier and above:

- **Frequency:** Daily at 2:00 AM UTC
- **Retention:** 
  - Pro Tier: 7 days
  - Team Tier: 14 days
  - Enterprise: 30+ days (configurable)
- **Type:** Full database snapshot
- **Storage:** Encrypted at rest in Supabase infrastructure
- **Access:** Via Supabase Dashboard → Database → Backups

**Current Status:** ✅ Enabled (verify in Supabase Dashboard)

### 2. Point-in-Time Recovery (PITR)

Available on Pro tier and above:

- **Granularity:** Restore to any point within retention window
- **Retention:** 7-30 days (tier dependent)
- **Use Case:** Recover from accidental data deletion or corruption
- **Access:** Via Supabase Dashboard or CLI

**Current Status:** ⚠️ Verify PITR is enabled in production

### 3. Manual Backup Scripts

For additional redundancy and custom backup schedules:

```bash
# Location: /scripts/backup-database.sh
# Schedule: Run via cron or GitHub Actions
# Frequency: Every 6 hours
# Retention: 30 days local, 90 days in S3
```

**Implementation Status:** 🔴 To be implemented

---

## 🔧 Backup Implementation

### Supabase Dashboard Configuration

1. **Enable Daily Backups:**
   - Navigate to: Project Settings → Database → Backups
   - Ensure "Daily Backups" is enabled
   - Set retention period to maximum available for your tier

2. **Enable Point-in-Time Recovery:**
   - Navigate to: Project Settings → Database → Backups
   - Enable PITR if available on your plan
   - Configure retention window (recommended: 14 days minimum)

3. **Configure Backup Notifications:**
   - Set up alerts for backup failures
   - Email: support@gvteway.com
   - Slack webhook: (to be configured)

### Manual Backup Script

Create automated backup script for additional redundancy:

```bash
#!/bin/bash
# File: scripts/backup-database.sh

# Configuration
PROJECT_REF="nhceygmzwmhuyqsjxquk"
BACKUP_DIR="/backups/supabase"
S3_BUCKET="gvteway-db-backups"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

# Export database using pg_dump via Supabase
supabase db dump --db-url "$DATABASE_URL" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Upload to S3 (if configured)
if [ -n "$S3_BUCKET" ]; then
  aws s3 cp "${BACKUP_FILE}.gz" "s3://${S3_BUCKET}/daily/${TIMESTAMP}.sql.gz"
fi

# Clean up old backups (local)
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### GitHub Actions Workflow

Automate backups via GitHub Actions:

```yaml
# File: .github/workflows/database-backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Run Backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          chmod +x ./scripts/backup-database.sh
          ./scripts/backup-database.sh
          
      - name: Notify on Failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Database backup failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🗄️ Backup Storage Strategy

### Primary Storage: Supabase Infrastructure
- **Location:** Supabase managed storage
- **Encryption:** AES-256 at rest
- **Access Control:** Supabase dashboard authentication
- **Retention:** Tier-dependent (7-30 days)

### Secondary Storage: AWS S3
- **Bucket:** `gvteway-db-backups`
- **Region:** us-east-1 (same as Supabase)
- **Encryption:** Server-side encryption (SSE-S3)
- **Versioning:** Enabled
- **Lifecycle Policy:**
  - Standard storage: 30 days
  - Glacier: 31-90 days
  - Delete: After 90 days
- **Access Control:** IAM roles with least privilege

### Tertiary Storage: Local Development
- **Location:** `/backups/supabase` (gitignored)
- **Purpose:** Quick restore for development
- **Retention:** 7 days
- **Security:** Encrypted disk volume

---

## 🔐 Security & Compliance

### Encryption
- **At Rest:** All backups encrypted with AES-256
- **In Transit:** TLS 1.3 for all backup transfers
- **Key Management:** Managed by Supabase and AWS KMS

### Access Control
- **Supabase Backups:** Owner and Admin roles only
- **S3 Backups:** IAM role-based access
- **Audit Logging:** All backup access logged

### Compliance
- **GDPR:** Backups include PII - same retention rules apply
- **Data Residency:** Backups stored in same region as primary database
- **Audit Trail:** All backup operations logged in `audit_logs` table

---

## 🔄 Restoration Procedures

### 1. Restore from Supabase Backup

**For Full Database Restore:**

```bash
# Via Supabase CLI
supabase db restore --backup-id <backup-id>

# Via Dashboard
1. Navigate to: Project Settings → Database → Backups
2. Select backup to restore
3. Click "Restore"
4. Confirm restoration (WARNING: This will overwrite current data)
```

**For Point-in-Time Recovery:**

```bash
# Via Supabase CLI
supabase db restore --pitr-timestamp "2025-01-09T10:30:00Z"

# Via Dashboard
1. Navigate to: Project Settings → Database → Backups
2. Select "Point-in-Time Recovery"
3. Choose timestamp
4. Confirm restoration
```

### 2. Restore from Manual Backup

```bash
# Decompress backup
gunzip backup_20250109_143000.sql.gz

# Restore to Supabase
psql "$DATABASE_URL" < backup_20250109_143000.sql

# Or via Supabase CLI
supabase db push --file backup_20250109_143000.sql
```

### 3. Selective Table Restore

For restoring specific tables without full database restore:

```bash
# Export specific table from backup
pg_restore -t table_name backup_file.sql > table_restore.sql

# Import to production
psql "$DATABASE_URL" < table_restore.sql
```

---

## 🧪 Testing & Validation

### Monthly Backup Testing

**Schedule:** First Monday of each month

**Procedure:**
1. Create test Supabase project
2. Restore latest backup to test project
3. Verify data integrity:
   - Row counts match
   - Foreign key constraints intact
   - RLS policies applied
   - Functions and triggers working
4. Test application connectivity
5. Document results in `docs/database/backup-tests/`

**Test Checklist:**
- [ ] Backup file accessible and not corrupted
- [ ] Restoration completes without errors
- [ ] All tables present with correct schema
- [ ] Row counts match production (within RPO window)
- [ ] Sample queries return expected results
- [ ] RLS policies enforced correctly
- [ ] Application can connect and authenticate
- [ ] Performance metrics acceptable

### Automated Validation

```sql
-- File: scripts/validate-backup.sql
-- Run after each restore to verify integrity

-- Check table counts
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY schemaname, tablename;

-- Verify foreign key constraints
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE contype = 'f';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
ORDER BY schemaname, tablename;
```

---

## 🚨 Disaster Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Detection:** User reports missing data or audit logs show bulk delete

**Response:**
1. Identify exact time of deletion from audit logs
2. Use PITR to restore to point before deletion
3. Verify restored data
4. Communicate with affected users

**RTO:** < 1 hour  
**RPO:** < 5 minutes (via PITR)

### Scenario 2: Database Corruption

**Detection:** Application errors, failed queries, or Supabase alerts

**Response:**
1. Assess extent of corruption
2. If partial: Restore affected tables from latest backup
3. If complete: Full database restore from latest backup
4. Verify data integrity
5. Investigate root cause

**RTO:** < 4 hours  
**RPO:** < 24 hours (daily backup)

### Scenario 3: Supabase Service Outage

**Detection:** Supabase status page or application monitoring

**Response:**
1. Monitor Supabase status updates
2. If extended outage (>4 hours):
   - Spin up new Supabase project
   - Restore from latest S3 backup
   - Update DNS/environment variables
   - Communicate with users
3. Once primary restored, sync any delta changes

**RTO:** < 8 hours  
**RPO:** < 6 hours (manual backup frequency)

### Scenario 4: Ransomware/Security Breach

**Detection:** Security alerts, unauthorized access, or encrypted data

**Response:**
1. Immediately isolate affected systems
2. Revoke all API keys and access tokens
3. Assess breach scope and data affected
4. Restore from backup BEFORE breach timestamp
5. Implement additional security measures
6. Notify affected users per GDPR requirements

**RTO:** < 24 hours  
**RPO:** < 24 hours

---

## 📋 Backup Monitoring & Alerts

### Key Metrics to Monitor

1. **Backup Success Rate:** Target 100%
2. **Backup Duration:** Baseline and alert on anomalies
3. **Backup Size:** Track growth trends
4. **Storage Usage:** Alert at 80% capacity
5. **Restoration Test Success:** Target 100%

### Alert Configuration

**Supabase Dashboard Alerts:**
- Backup failure
- PITR unavailable
- Storage capacity warnings

**Custom Monitoring (via Sentry/DataDog):**
```javascript
// Monitor backup job completion
if (backupJob.status === 'failed') {
  Sentry.captureException(new Error('Database backup failed'), {
    level: 'critical',
    tags: { service: 'database-backup' }
  });
}
```

**Slack Notifications:**
- Daily backup completion confirmation
- Immediate alert on backup failure
- Weekly backup test results

---

## 📝 Maintenance & Review

### Weekly Tasks
- [ ] Verify latest backup completed successfully
- [ ] Check backup storage usage
- [ ] Review backup logs for errors

### Monthly Tasks
- [ ] Perform backup restoration test
- [ ] Review and update retention policies
- [ ] Audit backup access logs
- [ ] Update documentation with any changes

### Quarterly Tasks
- [ ] Full disaster recovery drill
- [ ] Review and update RTO/RPO targets
- [ ] Assess backup costs and optimize
- [ ] Security audit of backup infrastructure

### Annual Tasks
- [ ] Comprehensive disaster recovery simulation
- [ ] Review and update backup strategy
- [ ] Evaluate new backup technologies
- [ ] Compliance audit of backup procedures

---

## 🔗 Related Documentation

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [Database Migration Guide](./MIGRATION_GUIDE.md)
- [Disaster Recovery Runbook](./DISASTER_RECOVERY_RUNBOOK.md)
- [Security Best Practices](../security/SECURITY_BEST_PRACTICES.md)

---

## 📞 Emergency Contacts

**Database Issues:**
- Primary: DevOps Team - devops@gvteway.com
- Secondary: CTO - cto@gvteway.com

**Supabase Support:**
- Dashboard: https://app.supabase.com/support
- Email: support@supabase.com
- Emergency: Enterprise support hotline (if applicable)

**AWS Support:**
- Console: https://console.aws.amazon.com/support
- Phone: 1-866-987-7638 (US)

---

## ✅ Implementation Checklist

### Immediate Actions (P0)
- [ ] Verify Supabase daily backups are enabled
- [ ] Enable Point-in-Time Recovery (if available)
- [ ] Set up backup failure notifications
- [ ] Document current backup retention settings

### Short-term (1-2 weeks)
- [ ] Implement manual backup script
- [ ] Set up GitHub Actions workflow
- [ ] Configure S3 bucket with lifecycle policies
- [ ] Perform first backup restoration test
- [ ] Create backup monitoring dashboard

### Medium-term (1 month)
- [ ] Establish monthly backup testing schedule
- [ ] Create disaster recovery runbook
- [ ] Set up automated backup validation
- [ ] Implement backup metrics tracking
- [ ] Train team on restoration procedures

### Long-term (Ongoing)
- [ ] Quarterly disaster recovery drills
- [ ] Continuous improvement of backup strategy
- [ ] Regular review of RTO/RPO targets
- [ ] Optimization of backup costs

---

**Last Updated:** 2025-01-09  
**Document Owner:** DevOps Team  
**Review Frequency:** Quarterly  
**Next Review:** 2025-04-09
