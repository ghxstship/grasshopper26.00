# Deployment & Infrastructure Documentation

## Overview
This directory contains comprehensive documentation for GVTEWAY's deployment and infrastructure strategy, including blue-green deployments, rollback procedures, load balancing, and multi-region configuration.

## Quick Links

### Core Documentation
- **[Blue-Green Deployment](./BLUE_GREEN_DEPLOYMENT.md)** - Zero-downtime deployment strategy
- **[Rollback Strategy](./ROLLBACK_STRATEGY.md)** - Emergency rollback procedures and automation
- **[Load Balancing](./LOAD_BALANCING.md)** - Health checks, load balancing, and monitoring
- **[Multi-Region](./MULTI_REGION.md)** - Multi-region deployment and disaster recovery

## Quick Start

### Health Checks

Check production health:
```bash
npm run health-check:production
```

Check staging health:
```bash
npm run health-check:staging
```

### Deployment

Deploy to staging (automatic via GitHub Actions):
```bash
git push origin develop
```

Deploy to production (automatic via GitHub Actions):
```bash
git push origin main
```

Manual deployment:
```bash
vercel --prod
```

### Rollback

Emergency rollback:
```bash
npm run rollback
```

Or manually trigger via GitHub Actions:
```bash
gh workflow run blue-green-deploy.yml -f rollback=true
```

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Vercel Edge Network (CDN)           │
│         Global Load Balancer                │
└─────────────┬───────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐         ┌────▼───┐
│  Blue  │         │ Green  │
│ (Live) │         │(Staging)│
└───┬────┘         └────┬───┘
    │                   │
    └─────────┬─────────┘
              │
    ┌─────────▼─────────┐
    │   Supabase DB     │
    │   (Multi-region)  │
    └───────────────────┘
```

## Deployment Environments

| Environment | URL | Branch | Auto-Deploy | Purpose |
|-------------|-----|--------|-------------|---------|
| **Production** | https://gvteway.com | `main` | ✅ Yes | Live production |
| **Staging** | https://staging.gvteway.com | `develop` | ✅ Yes | Pre-production testing |
| **Preview** | `*.vercel.app` | PR branches | ✅ Yes | Feature testing |

## Health Check Endpoints

| Endpoint | Purpose | Status Codes |
|----------|---------|--------------|
| `/api/health` | Comprehensive health check | 200 (healthy), 503 (unhealthy) |
| `/api/ready` | Readiness probe | 200 (ready), 503 (not ready) |
| `/api/live` | Liveness probe | 200 (alive) |

## CI/CD Workflows

### Standard Deployment (ci.yml)
- Triggered on: Push to `main` or `develop`
- Steps: Lint → Test → Build → Security Scan → Deploy
- Environments: Staging (develop), Production (main)

### Blue-Green Deployment (blue-green-deploy.yml)
- Triggered on: Push to `main` or manual dispatch
- Steps: Deploy Green → Health Check → Gradual Traffic Switch → Monitor
- Automatic rollback on failure

### Health Monitoring (health-monitor.yml)
- Triggered on: Every 5 minutes (cron)
- Checks production and staging health
- Alerts on failures via Slack

## Monitoring & Alerts

### Key Metrics
- **Availability**: 99.9% uptime target
- **Response Time (p95)**: < 2000ms
- **Response Time (p99)**: < 5000ms
- **Error Rate**: < 1%

### Alert Channels
- **Slack**: Real-time notifications
- **Sentry**: Error tracking and monitoring
- **Vercel Analytics**: Performance metrics

## Rollback Procedures

### Automatic Rollback
Triggered automatically when:
- Health checks fail after deployment
- Error rate > 5%
- Response time p95 > 5000ms

### Manual Rollback
```bash
# Quick rollback script
npm run rollback

# Or via GitHub Actions
gh workflow run blue-green-deploy.yml -f rollback=true
```

See [ROLLBACK_STRATEGY.md](./ROLLBACK_STRATEGY.md) for detailed procedures.

## Database Migrations

### Safe Migration Strategy
1. **Backward Compatible**: All migrations must be backward compatible
2. **Dual-Write Period**: Write to both old and new columns during transition
3. **Gradual Rollout**: Test on staging before production
4. **Rollback Plan**: Each migration has a corresponding rollback script

### Running Migrations
```bash
# Apply migrations
npm run db:migrate

# Rollback (if needed)
supabase db reset
```

## Security

### Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Secrets Management
All secrets are stored in:
- GitHub Secrets (CI/CD)
- Vercel Environment Variables (Runtime)
- `.env.local` (Local development - not committed)

Required secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `SLACK_WEBHOOK_URL`

## Multi-Region Configuration

### Current Setup
- **Primary**: US-East (iad1)
- **Secondary**: US-West (sfo1), Europe (fra1)
- **Database**: Supabase with read replicas

### Future Expansion
See [MULTI_REGION.md](./MULTI_REGION.md) for roadmap and implementation plan.

## Cost Breakdown

| Service | Monthly Cost |
|---------|--------------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| Sentry | $26 |
| **Total** | **$71/month** |

Multi-region expansion would add ~$40/month.

## Troubleshooting

### Deployment Failed
1. Check GitHub Actions logs
2. Review Vercel deployment logs
3. Check health endpoint: `curl https://gvteway.com/api/health`
4. If needed, rollback: `npm run rollback`

### Health Check Failing
1. Check Sentry for errors
2. Review Vercel Analytics for performance issues
3. Check database connectivity
4. Verify environment variables

### Rollback Not Working
1. Verify Vercel CLI is installed: `vercel --version`
2. Check VERCEL_TOKEN is set
3. Manual rollback via Vercel dashboard
4. Contact DevOps team

## Best Practices

1. **Always test on staging first** - Never deploy directly to production
2. **Monitor after deployment** - Watch metrics for 15-30 minutes
3. **Use feature flags** - Toggle features without deployment
4. **Keep Blue warm** - Maintain previous version for instant rollback
5. **Document incidents** - Create incident reports for all rollbacks
6. **Gradual rollouts** - Use traffic splitting for risky changes
7. **Automated tests** - Run full test suite before deployment

## Support

- **Documentation**: `/docs/deployment/`
- **Runbooks**: `/docs/operations/`
- **Support Email**: support@gvteway.com
- **Slack**: #engineering-alerts

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Blue-Green Deployment Pattern](https://martinfowler.com/bliki/BlueGreenDeployment.html)
