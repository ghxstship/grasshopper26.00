# Blue-Green Deployment Strategy

## Overview
Blue-green deployment is a release management strategy that reduces downtime and risk by running two identical production environments (Blue and Green). Only one environment serves production traffic at any time.

## Architecture

### Environment Setup
```
┌─────────────────────────────────────────────┐
│           Load Balancer / Router            │
│         (Vercel Edge Network)               │
└─────────────┬───────────────────────────────┘
              │
              ├──────────────┬─────────────────┐
              │              │                 │
         ┌────▼────┐    ┌────▼────┐      ┌────▼────┐
         │  Blue   │    │  Green  │      │ Canary  │
         │  (Live) │    │ (Idle)  │      │ (Test)  │
         └─────────┘    └─────────┘      └─────────┘
              │              │                 │
              └──────────────┴─────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Supabase DB   │
                    │  (Shared State) │
                    └─────────────────┘
```

## Implementation with Vercel

### 1. Environment Configuration

**Production Environments:**
- **Blue (production)**: `gvteway.com` - Current live environment
- **Green (staging)**: `staging.gvteway.com` - Pre-production environment
- **Canary (preview)**: `preview-*.gvteway.com` - Feature testing

### 2. Vercel Project Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Configure environments
vercel env add DEPLOYMENT_SLOT production
vercel env add DEPLOYMENT_SLOT staging
```

### 3. Deployment Workflow

#### Step 1: Deploy to Green (Staging)
```bash
# Deploy to staging environment
vercel --prod --env=staging

# Run smoke tests
npm run test:e2e:staging

# Run load tests
npm run test:load:staging
```

#### Step 2: Validate Green Environment
```yaml
# Health checks to perform:
- Database connectivity
- API endpoints responsiveness
- Authentication flows
- Payment processing
- Email delivery
- Cron job execution
- Asset loading (CDN)
- Third-party integrations (Stripe, Sentry)
```

#### Step 3: Switch Traffic (Blue → Green)
```bash
# Gradual rollout using Vercel's traffic splitting
vercel promote --scope=production --percentage=10
vercel promote --scope=production --percentage=25
vercel promote --scope=production --percentage=50
vercel promote --scope=production --percentage=100

# Or instant switch
vercel alias set staging.gvteway.com gvteway.com
```

#### Step 4: Monitor Green Environment
```bash
# Monitor for 15-30 minutes:
- Error rates (Sentry)
- Response times (Vercel Analytics)
- User sessions (active users)
- Database performance
- API success rates
```

#### Step 5: Decommission Blue or Rollback
```bash
# If successful: Keep Blue as new staging
vercel alias set gvteway.com staging.gvteway.com

# If issues detected: Rollback to Blue
vercel alias set staging.gvteway.com gvteway.com
```

## Automated Blue-Green Deployment

### GitHub Actions Workflow

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      rollback:
        description: 'Rollback to previous version'
        required: false
        type: boolean

jobs:
  deploy-green:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Green (Staging)
        run: |
          vercel deploy --prod --env=staging \
            --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      
      - name: Run Health Checks
        run: npm run health-check:staging
      
      - name: Run E2E Tests
        run: npm run test:e2e:staging
      
      - name: Run Load Tests
        run: npm run test:load:staging
  
  switch-traffic:
    needs: deploy-green
    runs-on: ubuntu-latest
    steps:
      - name: Gradual Traffic Switch
        run: |
          # 10% traffic
          vercel promote --percentage=10 --wait=300
          # 25% traffic
          vercel promote --percentage=25 --wait=300
          # 50% traffic
          vercel promote --percentage=50 --wait=300
          # 100% traffic
          vercel promote --percentage=100
      
      - name: Monitor Deployment
        run: npm run monitor:production --duration=1800
  
  rollback:
    if: ${{ github.event.inputs.rollback == 'true' || failure() }}
    runs-on: ubuntu-latest
    steps:
      - name: Rollback to Blue
        run: vercel rollback --token=${{ secrets.VERCEL_TOKEN }}
```

## Database Migration Strategy

### Zero-Downtime Migrations

```sql
-- Phase 1: Additive changes (safe for both Blue and Green)
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

-- Phase 2: Dual-write period (both old and new fields)
-- Application writes to both fields during transition

-- Phase 3: Backfill data
UPDATE users SET new_field = old_field WHERE new_field IS NULL;

-- Phase 4: Switch reads to new field
-- Deploy application update to read from new_field

-- Phase 5: Remove old field (after Green is stable)
ALTER TABLE users DROP COLUMN old_field;
```

### Migration Checklist
- [ ] All migrations are backward compatible
- [ ] Dual-write period for breaking changes
- [ ] Rollback plan for each migration
- [ ] Database backups before migration
- [ ] Test migrations on staging first

## Health Check Endpoints

### Implementation

```typescript
// src/app/api/health/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.DEPLOYMENT_SLOT || 'unknown',
    status: 'healthy',
    checks: {
      database: { status: 'unknown', latency: 0 },
      redis: { status: 'unknown', latency: 0 },
      stripe: { status: 'unknown', latency: 0 },
    }
  };

  try {
    // Database check
    const dbStart = Date.now();
    const supabase = createClient();
    const { error } = await supabase.from('users').select('count').limit(1);
    checks.checks.database = {
      status: error ? 'unhealthy' : 'healthy',
      latency: Date.now() - dbStart
    };

    // Add more checks as needed
    
    const allHealthy = Object.values(checks.checks)
      .every(check => check.status === 'healthy');
    
    checks.status = allHealthy ? 'healthy' : 'degraded';
    
    return Response.json(checks, { 
      status: allHealthy ? 200 : 503 
    });
  } catch (error) {
    return Response.json({ 
      ...checks, 
      status: 'unhealthy',
      error: error.message 
    }, { status: 503 });
  }
}
```

## Monitoring & Alerts

### Key Metrics to Monitor
- **Response Time**: p50, p95, p99 latencies
- **Error Rate**: 5xx errors, client errors
- **Traffic**: Requests per second
- **Database**: Query performance, connection pool
- **Memory**: Heap usage, garbage collection
- **CPU**: Utilization percentage

### Alert Thresholds
```yaml
alerts:
  error_rate:
    threshold: 1%
    window: 5m
    action: auto_rollback
  
  response_time_p95:
    threshold: 2000ms
    window: 5m
    action: notify
  
  database_connections:
    threshold: 80%
    window: 2m
    action: notify
```

## Rollback Procedures

See [ROLLBACK_STRATEGY.md](./ROLLBACK_STRATEGY.md) for detailed rollback procedures.

## Best Practices

1. **Always test on Green first**: Never deploy directly to Blue
2. **Gradual rollout**: Use traffic splitting (10% → 25% → 50% → 100%)
3. **Monitor actively**: Watch metrics for 15-30 minutes after switch
4. **Keep Blue warm**: Maintain Blue environment for instant rollback
5. **Database compatibility**: Ensure migrations work with both versions
6. **Feature flags**: Use flags for risky features to toggle without deployment
7. **Automated tests**: Run full test suite before traffic switch
8. **Communication**: Notify team of deployment windows

## Cost Considerations

- **Vercel Pro Plan**: Required for traffic splitting and multiple environments
- **Estimated Cost**: $20/month per environment (Blue + Green = $40/month)
- **Database**: Shared Supabase instance (no additional cost)
- **Monitoring**: Included in Vercel Analytics and Sentry plans

## References

- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)
- [Blue-Green Deployment Pattern](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Zero-Downtime Database Migrations](https://www.braintreepayments.com/blog/safe-operations-for-high-volume-postgresql/)
