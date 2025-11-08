# Grasshopper 26.0 - Production Deployment Guide

**Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**Status:** Production Ready

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- [ ] Vercel account (for hosting)
- [ ] Supabase project (for database)
- [ ] Stripe account (for payments)
- [ ] Resend account (for emails)
- [ ] GitHub repository (for CI/CD)

### Required Tools
- [ ] Node.js 18.x or higher
- [ ] npm 9.x or higher
- [ ] Git
- [ ] Supabase CLI
- [ ] Vercel CLI (optional)

### Optional Services
- [ ] Redis (for caching)
- [ ] Sentry (for error tracking)
- [ ] Slack (for notifications)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/grasshopper.git
cd grasshopper/experience-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.production` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# Application
NEXT_PUBLIC_APP_URL=https://grasshopper.com
NEXT_PUBLIC_BRAND_NAME=Grasshopper

# Security
CSRF_SECRET=generate_random_32_char_string

# Optional: Redis
REDIS_URL=redis://...

# Optional: Monitoring
SENTRY_DSN=https://...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-...
```

### 4. Generate Secrets

```bash
# Generate CSRF secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and keys

### 2. Link Local Project

```bash
npx supabase link --project-ref your-project-ref
```

### 3. Apply Migrations

```bash
# Review migrations
ls supabase/migrations/

# Apply all migrations
npx supabase db push

# Verify migrations
npx supabase db diff
```

### 4. Verify Database

```sql
-- Connect to Supabase SQL Editor
-- Run verification queries

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies;
```

### 5. Seed Data (Optional)

```bash
# Seed data is included in migrations
# Or run manually:
npx supabase db reset
```

---

## Application Deployment

### Method 1: Automated Deployment (Recommended)

#### Setup GitHub Actions

1. Add secrets to GitHub repository:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `SUPABASE_ACCESS_TOKEN`
   - `SLACK_WEBHOOK` (optional)

2. Push to main branch:

```bash
git push origin main
```

3. GitHub Actions will automatically:
   - Run tests
   - Build application
   - Deploy to Vercel
   - Run migrations
   - Send notifications

#### Using Deployment Script

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### Method 2: Manual Deployment

#### 1. Run Pre-Deployment Checks

```bash
# Lint
npm run lint

# Type check
npm run type-check

# Tests
npm run test

# Build
npm run build
```

#### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

#### 3. Configure Vercel

1. Go to Vercel dashboard
2. Add environment variables
3. Configure domains
4. Enable automatic deployments

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Health check
curl https://grasshopper.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-06T..."}
```

### 2. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://grasshopper.com/api/webhooks/stripe/enhanced`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `checkout.session.completed`
4. Copy webhook secret to environment variables

### 3. Configure Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Create buckets:
   - `event-images` (public)
   - `artist-images` (public)
   - `product-images` (public)
   - `avatars` (public)
   - `documents` (private)
3. Configure RLS policies for each bucket

### 4. Warm Up Cache

```bash
# Warm up critical pages
curl https://grasshopper.com
curl https://grasshopper.com/events
curl https://grasshopper.com/api/v1/events
```

### 5. Test Critical Flows

- [ ] User registration
- [ ] User login
- [ ] Event browsing
- [ ] Ticket purchase
- [ ] Payment processing
- [ ] Email notifications
- [ ] Order confirmation

---

## Monitoring & Maintenance

### Setup Monitoring

#### 1. Sentry (Error Tracking)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Add DSN to environment variables
```

#### 2. Vercel Analytics

1. Enable in Vercel dashboard
2. Add to `next.config.js`:

```javascript
module.exports = {
  analytics: {
    id: process.env.VERCEL_ANALYTICS_ID,
  },
};
```

#### 3. Custom Monitoring

Monitor these metrics:
- API response times
- Error rates
- Database query performance
- Cache hit rates
- User activity

### Database Maintenance

```bash
# Weekly tasks
- Review slow queries
- Optimize indexes
- Vacuum database
- Check disk usage

# Monthly tasks
- Review RLS policies
- Audit user permissions
- Clean up old data
- Backup verification
```

### Security Updates

```bash
# Weekly
npm audit
npm audit fix

# Monthly
npm outdated
npm update
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check Supabase status
curl https://status.supabase.com

# Verify connection string
echo $NEXT_PUBLIC_SUPABASE_URL

# Test connection
npx supabase db ping
```

#### 2. Build Failures

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

#### 3. Webhook Failures

```bash
# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Check webhook logs in Stripe Dashboard
# Verify endpoint URL is correct
# Check server logs for errors
```

#### 4. Performance Issues

```bash
# Check Vercel logs
vercel logs

# Review database performance
# Check for slow queries in Supabase dashboard

# Verify Redis connection (if using)
redis-cli ping
```

### Rollback Procedure

```bash
# 1. Identify last working deployment
vercel ls

# 2. Rollback to previous deployment
vercel rollback [deployment-url]

# 3. Rollback database (if needed)
npx supabase db reset --db-url [previous-backup]

# 4. Notify team
# Send Slack notification
# Update status page
```

### Support Contacts

- **Technical Lead:** tech@grasshopper.com
- **DevOps:** devops@grasshopper.com
- **Emergency:** +1-555-SUPPORT

---

## Checklist

### Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Storage buckets created
- [ ] SSL certificate active
- [ ] DNS configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Error tracking configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Accessibility audit passed
- [ ] Documentation complete
- [ ] Team trained
- [ ] Incident response plan ready

### Post-Launch Checklist

- [ ] Health checks passing
- [ ] All critical flows tested
- [ ] Monitoring dashboards active
- [ ] Alerts configured
- [ ] Performance metrics baseline established
- [ ] Backup verified
- [ ] Team notified
- [ ] Status page updated
- [ ] Announcement sent

---

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Overview](./docs/architecture.md)
- [Security Guidelines](./docs/security.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

## Support

For deployment support:
- Email: devops@grasshopper.com
- Slack: #deployments
- Documentation: https://docs.grasshopper.com

---

**Last Updated:** November 6, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
