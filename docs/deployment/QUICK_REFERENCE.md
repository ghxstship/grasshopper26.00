# Deployment Quick Reference Guide

## Emergency Contacts
- **Support Email**: support@gvteway.com
- **Slack Channel**: #engineering-alerts
- **On-Call**: Check PagerDuty rotation

## Quick Commands

### Health Checks
```bash
# Check production health
npm run health-check:production

# Check staging health
npm run health-check:staging

# Check specific endpoint
curl https://gvteway.com/api/health | jq
```

### Deployment
```bash
# Deploy to staging (automatic)
git push origin develop

# Deploy to production (automatic)
git push origin main

# Manual deployment
vercel --prod
```

### Rollback
```bash
# Emergency rollback
npm run rollback

# Via GitHub Actions
gh workflow run blue-green-deploy.yml -f rollback=true
```

## Health Check Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| `healthy` | All systems operational | None |
| `degraded` | Some services slow | Monitor closely |
| `unhealthy` | Critical failure | Immediate action required |

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations tested on staging
- [ ] Feature flags configured
- [ ] Team notified of deployment window

### During Deployment
- [ ] Monitor health checks
- [ ] Watch error rates in Sentry
- [ ] Check response times in Vercel Analytics
- [ ] Verify database connectivity
- [ ] Test critical user flows

### Post-Deployment
- [ ] Monitor for 15-30 minutes
- [ ] Check Sentry for new errors
- [ ] Verify cron jobs running
- [ ] Update deployment log
- [ ] Notify team of completion

## Rollback Decision Tree

```
Is production down?
├─ YES → Immediate rollback (npm run rollback)
└─ NO → Check error rate
    ├─ > 5% → Rollback
    ├─ 1-5% → Monitor for 5 minutes, then decide
    └─ < 1% → Continue monitoring
```

## Common Issues

### Deployment Failed
1. Check GitHub Actions logs
2. Review Vercel deployment logs
3. Verify environment variables
4. Check database connectivity

### Health Check Failing
1. Check `/api/health` endpoint
2. Review Sentry errors
3. Verify database status
4. Check external service status (Stripe, etc.)

### High Error Rate
1. Check Sentry dashboard
2. Review recent deployments
3. Check database performance
4. Consider rollback if > 5%

## Monitoring URLs

- **Production**: https://gvteway.com
- **Staging**: https://staging.gvteway.com
- **Health Check**: https://gvteway.com/api/health
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Sentry**: https://sentry.io
- **Supabase**: https://supabase.com/dashboard

## SLA Targets

- **Uptime**: 99.9%
- **Response Time (p95)**: < 2000ms
- **Response Time (p99)**: < 5000ms
- **Error Rate**: < 1%
- **RTO**: < 15 minutes
- **RPO**: < 5 minutes

## Escalation Path

1. **Level 1**: Check documentation, attempt self-resolution
2. **Level 2**: Post in #engineering-alerts
3. **Level 3**: Page on-call engineer
4. **Level 4**: Escalate to Engineering Manager

## Useful Scripts

```bash
# View deployment logs
vercel logs gvteway.com

# List recent deployments
vercel ls --prod

# Check environment variables
vercel env ls

# Run database migrations
npm run db:migrate

# Backup database
./scripts/backup-database.sh
```

## Documentation Links

- [Blue-Green Deployment](./BLUE_GREEN_DEPLOYMENT.md)
- [Rollback Strategy](./ROLLBACK_STRATEGY.md)
- [Load Balancing](./LOAD_BALANCING.md)
- [Multi-Region](./MULTI_REGION.md)
- [Full Documentation](./README.md)
