# Rollback Strategy & Procedures

## Overview
A comprehensive rollback strategy ensures rapid recovery from failed deployments with minimal user impact. This document outlines automated and manual rollback procedures for GVTEWAY.

## Rollback Decision Matrix

| Severity | Condition | Action | Timeline |
|----------|-----------|--------|----------|
| **P0 - Critical** | Service down, data loss, security breach | Immediate automatic rollback | < 2 minutes |
| **P1 - High** | Error rate > 5%, payment failures | Automatic rollback after 5min | < 5 minutes |
| **P2 - Medium** | Error rate 1-5%, performance degradation | Manual review, then rollback | < 15 minutes |
| **P3 - Low** | Minor UI issues, non-critical bugs | Fix forward or scheduled rollback | < 1 hour |

## Automatic Rollback Triggers

### 1. Health Check Failures
```typescript
// scripts/health-check.ts
interface HealthCheckConfig {
  endpoint: string;
  maxFailures: number;
  checkInterval: number;
  timeout: number;
}

async function monitorHealth(config: HealthCheckConfig) {
  let failures = 0;
  
  const interval = setInterval(async () => {
    try {
      const response = await fetch(config.endpoint, {
        signal: AbortSignal.timeout(config.timeout)
      });
      
      if (!response.ok) {
        failures++;
        console.error(`Health check failed: ${response.status}`);
        
        if (failures >= config.maxFailures) {
          await triggerRollback('health_check_failure');
          clearInterval(interval);
        }
      } else {
        failures = 0; // Reset on success
      }
    } catch (error) {
      failures++;
      console.error(`Health check error: ${error.message}`);
      
      if (failures >= config.maxFailures) {
        await triggerRollback('health_check_timeout');
        clearInterval(interval);
      }
    }
  }, config.checkInterval);
}
```

### 2. Error Rate Monitoring
```typescript
// scripts/monitor-errors.ts
import * as Sentry from '@sentry/nextjs';

interface ErrorThreshold {
  rate: number;      // Error rate percentage
  window: number;    // Time window in seconds
  minSamples: number; // Minimum requests to consider
}

async function monitorErrorRate(threshold: ErrorThreshold) {
  const stats = await Sentry.getStats({
    project: process.env.SENTRY_PROJECT,
    interval: `${threshold.window}s`
  });
  
  const errorRate = (stats.errors / stats.total) * 100;
  
  if (stats.total >= threshold.minSamples && errorRate > threshold.rate) {
    console.error(`Error rate ${errorRate}% exceeds threshold ${threshold.rate}%`);
    await triggerRollback('high_error_rate', { errorRate, threshold: threshold.rate });
  }
}
```

### 3. Performance Degradation
```typescript
// scripts/monitor-performance.ts
interface PerformanceThreshold {
  p95Latency: number;  // milliseconds
  p99Latency: number;  // milliseconds
  duration: number;    // seconds to sustain before rollback
}

async function monitorPerformance(threshold: PerformanceThreshold) {
  const metrics = await getVercelAnalytics({
    timeframe: `${threshold.duration}s`
  });
  
  if (metrics.p95 > threshold.p95Latency || metrics.p99 > threshold.p99Latency) {
    console.error(`Performance degradation detected: p95=${metrics.p95}ms, p99=${metrics.p99}ms`);
    await triggerRollback('performance_degradation', metrics);
  }
}
```

## Rollback Procedures

### Procedure 1: Instant Vercel Rollback (< 2 minutes)

**Use Case:** Critical production issues requiring immediate revert

```bash
#!/bin/bash
# scripts/rollback-instant.sh

set -e

echo "🔴 INITIATING INSTANT ROLLBACK"
echo "================================"

# Get current deployment
CURRENT_DEPLOYMENT=$(vercel ls --prod --token=$VERCEL_TOKEN | head -2 | tail -1 | awk '{print $1}')
echo "Current deployment: $CURRENT_DEPLOYMENT"

# Get previous deployment
PREVIOUS_DEPLOYMENT=$(vercel ls --prod --token=$VERCEL_TOKEN | head -3 | tail -1 | awk '{print $1}')
echo "Previous deployment: $PREVIOUS_DEPLOYMENT"

# Confirm rollback
read -p "Rollback to $PREVIOUS_DEPLOYMENT? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled"
  exit 1
fi

# Execute rollback
echo "Rolling back..."
vercel rollback $PREVIOUS_DEPLOYMENT --token=$VERCEL_TOKEN

# Verify rollback
sleep 10
NEW_DEPLOYMENT=$(vercel ls --prod --token=$VERCEL_TOKEN | head -2 | tail -1 | awk '{print $1}')

if [ "$NEW_DEPLOYMENT" == "$PREVIOUS_DEPLOYMENT" ]; then
  echo "✅ Rollback successful"
  
  # Notify team
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🔴 Production rolled back from $CURRENT_DEPLOYMENT to $PREVIOUS_DEPLOYMENT\"}"
else
  echo "❌ Rollback failed"
  exit 1
fi
```

### Procedure 2: Database Rollback (< 5 minutes)

**Use Case:** Migration caused data issues or breaking changes

```bash
#!/bin/bash
# scripts/rollback-database.sh

set -e

echo "🔴 INITIATING DATABASE ROLLBACK"
echo "================================"

# Get latest migration
LATEST_MIGRATION=$(ls -1 supabase/migrations | tail -1)
echo "Latest migration: $LATEST_MIGRATION"

# Create rollback migration
TIMESTAMP=$(date +%Y%m%d%H%M%S)
ROLLBACK_FILE="supabase/migrations/${TIMESTAMP}_rollback_${LATEST_MIGRATION}"

echo "Creating rollback migration: $ROLLBACK_FILE"

# Generate rollback SQL (manual step - requires pre-written rollback)
if [ -f "supabase/migrations/rollbacks/${LATEST_MIGRATION}" ]; then
  cp "supabase/migrations/rollbacks/${LATEST_MIGRATION}" "$ROLLBACK_FILE"
else
  echo "❌ No rollback script found for $LATEST_MIGRATION"
  echo "Manual intervention required"
  exit 1
fi

# Backup database before rollback
echo "Creating database backup..."
./scripts/backup-database.sh

# Apply rollback migration
echo "Applying rollback migration..."
supabase db push

# Verify database state
echo "Verifying database state..."
npm run db:verify

echo "✅ Database rollback complete"
```

### Procedure 3: Feature Flag Rollback (< 30 seconds)

**Use Case:** New feature causing issues, instant disable without deployment

```typescript
// src/lib/feature-flags.ts
import { createClient } from '@/lib/supabase/server';

export async function disableFeature(featureName: string, reason: string) {
  const supabase = createClient();
  
  // Update feature flag in database
  const { error } = await supabase
    .from('feature_flags')
    .update({ 
      enabled: false,
      disabled_at: new Date().toISOString(),
      disabled_reason: reason
    })
    .eq('name', featureName);
  
  if (error) {
    console.error(`Failed to disable feature ${featureName}:`, error);
    throw error;
  }
  
  // Notify team
  await notifySlack({
    text: `🚫 Feature "${featureName}" disabled: ${reason}`,
    channel: '#engineering-alerts'
  });
  
  // Log to Sentry
  Sentry.captureMessage(`Feature rollback: ${featureName}`, {
    level: 'warning',
    extra: { reason }
  });
  
  console.log(`✅ Feature "${featureName}" disabled successfully`);
}
```

### Procedure 4: Gradual Traffic Rollback (< 10 minutes)

**Use Case:** Issues detected during gradual rollout

```bash
#!/bin/bash
# scripts/rollback-traffic.sh

set -e

echo "🔴 INITIATING TRAFFIC ROLLBACK"
echo "================================"

# Gradually shift traffic back to previous version
echo "Shifting 100% → 50% traffic to new version..."
vercel promote --percentage=50 --token=$VERCEL_TOKEN
sleep 120

echo "Shifting 50% → 25% traffic to new version..."
vercel promote --percentage=25 --token=$VERCEL_TOKEN
sleep 120

echo "Shifting 25% → 0% traffic to new version..."
vercel promote --percentage=0 --token=$VERCEL_TOKEN

echo "✅ Traffic fully rolled back to previous version"
```

## Rollback Automation

### GitHub Actions Workflow

```yaml
# .github/workflows/auto-rollback.yml
name: Auto Rollback

on:
  workflow_dispatch:
    inputs:
      reason:
        description: 'Rollback reason'
        required: true
        type: choice
        options:
          - high_error_rate
          - performance_degradation
          - health_check_failure
          - security_incident
          - manual_trigger
      
      deployment_id:
        description: 'Deployment ID to rollback (optional)'
        required: false
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Notify Team - Rollback Started
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🔴 ROLLBACK INITIATED",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Reason:* ${{ github.event.inputs.reason }}\n*Triggered by:* ${{ github.actor }}\n*Time:* $(date -u +%Y-%m-%dT%H:%M:%SZ)"
                  }
                }
              ]
            }
      
      - name: Execute Rollback
        run: |
          if [ -n "${{ github.event.inputs.deployment_id }}" ]; then
            vercel rollback ${{ github.event.inputs.deployment_id }} --token=${{ secrets.VERCEL_TOKEN }}
          else
            vercel rollback --token=${{ secrets.VERCEL_TOKEN }}
          fi
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      
      - name: Verify Rollback
        run: |
          sleep 30
          npm run health-check:production
      
      - name: Create Incident Report
        run: |
          TIMESTAMP=$(date +%Y%m%d_%H%M%S)
          REPORT_FILE="docs/incidents/rollback_${TIMESTAMP}.md"
          
          cat > $REPORT_FILE << EOF
          # Rollback Incident Report
          
          **Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
          **Reason:** ${{ github.event.inputs.reason }}
          **Triggered By:** ${{ github.actor }}
          **Deployment ID:** ${{ github.event.inputs.deployment_id }}
          
          ## Timeline
          - Rollback initiated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
          - Rollback completed: TBD
          
          ## Impact
          - TBD
          
          ## Root Cause
          - TBD
          
          ## Action Items
          - [ ] Investigate root cause
          - [ ] Implement fix
          - [ ] Add tests to prevent recurrence
          - [ ] Update runbook
          EOF
          
          git add $REPORT_FILE
          git commit -m "docs: Add rollback incident report"
          git push
      
      - name: Notify Team - Rollback Complete
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "✅ ROLLBACK COMPLETED SUCCESSFULLY"
            }
      
      - name: Notify Team - Rollback Failed
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "❌ ROLLBACK FAILED - MANUAL INTERVENTION REQUIRED"
            }
```

## Database Migration Rollback Strategy

### Forward-Only Migrations (Preferred)

```sql
-- Instead of dropping columns, mark as deprecated
ALTER TABLE users ADD COLUMN deprecated_old_field BOOLEAN DEFAULT TRUE;

-- Instead of renaming, create new column and dual-write
ALTER TABLE users ADD COLUMN new_name VARCHAR(255);
-- Application writes to both columns during transition

-- Instead of changing types, create new column
ALTER TABLE users ADD COLUMN amount_cents INTEGER;
-- Backfill: UPDATE users SET amount_cents = amount * 100;
```

### Rollback Migrations (When Necessary)

```bash
# supabase/migrations/rollbacks/
# Each migration should have a corresponding rollback script

# Example:
# 20250109_add_user_preferences.sql
# 20250109_add_user_preferences_rollback.sql
```

## Monitoring During Rollback

### Key Metrics Dashboard

```typescript
// scripts/rollback-monitor.ts
interface RollbackMetrics {
  errorRate: number;
  responseTime: { p50: number; p95: number; p99: number };
  activeUsers: number;
  databaseConnections: number;
  deploymentStatus: string;
}

async function monitorRollback(durationMinutes: number) {
  const startTime = Date.now();
  const endTime = startTime + (durationMinutes * 60 * 1000);
  
  console.log('📊 Monitoring rollback...\n');
  
  while (Date.now() < endTime) {
    const metrics = await collectMetrics();
    
    console.log(`
      Error Rate: ${metrics.errorRate.toFixed(2)}%
      Response Time (p95): ${metrics.responseTime.p95}ms
      Active Users: ${metrics.activeUsers}
      DB Connections: ${metrics.databaseConnections}
      Status: ${metrics.deploymentStatus}
    `);
    
    // Check for anomalies
    if (metrics.errorRate > 1.0) {
      console.error('⚠️  Error rate still elevated after rollback');
    }
    
    await sleep(30000); // Check every 30 seconds
  }
  
  console.log('\n✅ Rollback monitoring complete');
}
```

## Communication Protocol

### Incident Communication Template

```markdown
# Production Incident - Rollback Executed

**Status:** 🔴 ACTIVE / 🟡 MONITORING / 🟢 RESOLVED

**Incident ID:** INC-2025-XXXX
**Start Time:** YYYY-MM-DD HH:MM UTC
**Detection Time:** YYYY-MM-DD HH:MM UTC
**Rollback Time:** YYYY-MM-DD HH:MM UTC

## Summary
[Brief description of the issue]

## Impact
- **Users Affected:** [number or percentage]
- **Services Impacted:** [list services]
- **Duration:** [time]

## Timeline
- HH:MM - Issue detected
- HH:MM - Rollback initiated
- HH:MM - Rollback completed
- HH:MM - Monitoring period
- HH:MM - Incident resolved

## Root Cause
[To be determined / Brief explanation]

## Resolution
Rolled back to deployment: [deployment-id]

## Next Steps
1. [ ] Post-mortem scheduled
2. [ ] Root cause analysis
3. [ ] Preventive measures identified
4. [ ] Fix implemented and tested
5. [ ] Re-deployment planned
```

## Post-Rollback Checklist

- [ ] Verify all services are healthy
- [ ] Confirm error rates are normal
- [ ] Check database integrity
- [ ] Review Sentry for new errors
- [ ] Monitor user sessions for 30 minutes
- [ ] Create incident report
- [ ] Schedule post-mortem
- [ ] Notify stakeholders
- [ ] Update status page
- [ ] Document lessons learned

## Testing Rollback Procedures

```bash
# Test rollback in staging
npm run test:rollback:staging

# Simulate production rollback (dry-run)
npm run test:rollback:production --dry-run
```

## Rollback Metrics & SLAs

| Metric | Target | Current |
|--------|--------|---------|
| Time to Detect (TTD) | < 5 minutes | TBD |
| Time to Rollback (TTR) | < 10 minutes | TBD |
| Rollback Success Rate | > 99% | TBD |
| Mean Time to Recovery (MTTR) | < 15 minutes | TBD |

## References

- [Incident Response Playbook](../operations/INCIDENT_RESPONSE.md)
- [Blue-Green Deployment](./BLUE_GREEN_DEPLOYMENT.md)
- [Monitoring & Alerts](./MONITORING.md)
- [Database Migration Guide](../database/MIGRATIONS.md)
