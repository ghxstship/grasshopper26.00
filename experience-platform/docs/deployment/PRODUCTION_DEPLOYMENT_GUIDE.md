# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Grasshopper 26.00 - Live Entertainment Platform

**Version:** 26.0.0  
**Last Updated:** November 6, 2025  
**Status:** ✅ Production Ready

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Quality
- [x] Zero TypeScript errors
- [x] Zero npm vulnerabilities
- [x] All tests passing
- [x] Code reviewed
- [x] Security hardening complete

### ✅ Infrastructure
- [x] CI/CD pipeline configured
- [x] Error monitoring (Sentry) integrated
- [x] Database migrations ready
- [x] Environment variables documented

### ✅ Features
- [x] All API endpoints implemented (43 total)
- [x] Admin UI complete
- [x] Authentication & authorization
- [x] Payment processing (Stripe)
- [x] Email notifications (Resend)

---

## 🔧 ENVIRONMENT SETUP

### 1. Required Services

#### Supabase (Database & Auth)
1. Create project at [supabase.com](https://supabase.com)
2. Note your project URL and keys
3. Run migrations: `npm run db:migrate`

#### Stripe (Payments)
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Configure webhook endpoint
4. Note webhook signing secret

#### Resend (Email)
1. Create account at [resend.com](https://resend.com)
2. Verify your domain
3. Get API key

#### Sentry (Error Monitoring)
1. Create project at [sentry.io](https://sentry.io)
2. Get DSN for client and server
3. Get auth token for source maps

### 2. Environment Variables

Create `.env.local` with:

```bash
# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_DB_PASSWORD=your-db-password

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# Security
CSRF_SECRET=generate-random-32-char-string
```

---

## 📦 DEPLOYMENT STEPS

### Option A: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Link Project
```bash
cd experience-platform
vercel link
```

#### 3. Configure Environment Variables
```bash
# Add all environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all variables
```

#### 4. Deploy
```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploy via GitHub)
git push origin main
```

### Option B: Docker

#### 1. Build Image
```bash
docker build -t grasshopper:26.0.0 .
```

#### 2. Run Container
```bash
docker run -p 3000:3000 \
  --env-file .env.production \
  grasshopper:26.0.0
```

### Option C: Manual Deployment

#### 1. Build Application
```bash
npm run build
```

#### 2. Start Production Server
```bash
npm start
```

---

## 🗄️ DATABASE SETUP

### 1. Run Migrations
```bash
# Apply all migrations
npm run db:migrate

# Or using Supabase CLI
npx supabase db push
```

### 2. Seed Initial Data (Optional)
```bash
npm run db:seed
```

### 3. Verify Tables
Check that all tables exist:
- brands
- events
- artists
- products
- orders
- tickets
- notifications
- user_profiles
- brand_users

### 4. Row Level Security (RLS)
Verify RLS policies are enabled on all tables:
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 🔐 SECURITY CONFIGURATION

### 1. Stripe Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe/enhanced`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `checkout.session.completed`
4. Copy webhook signing secret to env vars

### 2. CORS Configuration
Update `src/lib/security/headers.ts` if needed:
```typescript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com',
];
```

### 3. CSP Headers
Review Content Security Policy in `src/lib/security/headers.ts`

### 4. API Rate Limiting
Verify rate limits in `src/lib/api/rate-limiter.ts`:
- Read operations: 100 requests/minute
- Write operations: 20 requests/minute
- Auth operations: 5 requests/minute

---

## 🧪 POST-DEPLOYMENT TESTING

### 1. Health Checks
```bash
# Check API health
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/health/db
```

### 2. Critical User Flows
- [ ] User registration
- [ ] Email verification
- [ ] Login/logout
- [ ] Browse events
- [ ] Purchase tickets
- [ ] Payment processing
- [ ] Order confirmation email
- [ ] Ticket generation
- [ ] Admin login
- [ ] Create event (admin)

### 3. Performance Testing
```bash
# Run load test
npx artillery quick --count 100 --num 10 https://your-domain.com
```

### 4. Security Scan
```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm run security-check
```

---

## 📊 MONITORING SETUP

### 1. Sentry Configuration
- Verify error tracking is working
- Set up alerts for critical errors
- Configure performance monitoring
- Enable session replay

### 2. Vercel Analytics (if using Vercel)
- Enable Web Analytics
- Enable Speed Insights
- Monitor Core Web Vitals

### 3. Database Monitoring
- Set up Supabase alerts
- Monitor connection pool
- Track slow queries
- Set up backups

### 4. Uptime Monitoring
Use services like:
- UptimeRobot
- Pingdom
- StatusCake

---

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow
Already configured in `.github/workflows/ci.yml`:

**On Push to `main`:**
1. Lint code
2. Type check
3. Run tests
4. Build application
5. Security scan
6. Deploy to production
7. Run database migrations
8. Send Slack notification

**On Push to `develop`:**
1. Same as above
2. Deploy to staging

### Manual Deployment
```bash
# Trigger deployment manually
gh workflow run ci.yml
```

---

## 🚨 TROUBLESHOOTING

### Build Failures

**Issue:** TypeScript errors
```bash
# Solution
npm run type-check
# Fix any errors shown
```

**Issue:** Missing dependencies
```bash
# Solution
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

**Issue:** Database connection failed
- Check Supabase URL and keys
- Verify IP allowlist in Supabase
- Check connection pool limits

**Issue:** Stripe webhook failures
- Verify webhook secret
- Check endpoint URL
- Review Stripe logs

**Issue:** Email sending failed
- Verify Resend API key
- Check domain verification
- Review email templates

### Performance Issues

**Issue:** Slow page loads
- Enable caching
- Optimize images
- Review database queries
- Check CDN configuration

**Issue:** High memory usage
- Review memory leaks
- Optimize React components
- Check for infinite loops

---

## 📈 SCALING CONSIDERATIONS

### Database
- **Current:** Supabase Free/Pro tier
- **Scale to:** Dedicated instance
- **When:** >10,000 concurrent users

### Application
- **Current:** Vercel Hobby/Pro
- **Scale to:** Enterprise plan
- **When:** >100,000 requests/day

### CDN
- **Current:** Vercel Edge Network
- **Alternative:** Cloudflare
- **When:** Global audience

### Caching
- **Implement:** Redis for session storage
- **Implement:** CDN for static assets
- **Implement:** Database query caching

---

## 🔒 BACKUP & RECOVERY

### Database Backups
```bash
# Manual backup
npx supabase db dump > backup-$(date +%Y%m%d).sql

# Restore from backup
npx supabase db reset
psql -h your-db-host -U postgres -d postgres < backup.sql
```

### Automated Backups
- Supabase: Daily automatic backups (Pro plan)
- Custom: Set up cron job for backups
- Storage: AWS S3 or similar

### Disaster Recovery Plan
1. Database restore: 15 minutes
2. Application redeploy: 5 minutes
3. DNS propagation: 5-60 minutes
4. **Total RTO:** <2 hours

---

## 📞 SUPPORT & MAINTENANCE

### Regular Maintenance
- **Daily:** Monitor error logs
- **Weekly:** Review performance metrics
- **Monthly:** Security updates
- **Quarterly:** Dependency updates

### On-Call Procedures
1. Check Sentry for errors
2. Review Vercel logs
3. Check database status
4. Verify third-party services
5. Escalate if needed

### Contact Information
- **Technical Lead:** [Your contact]
- **DevOps:** [Your contact]
- **Support:** [Your contact]

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- API Documentation: `/docs/api`
- Admin Guide: `/docs/admin`
- User Guide: `/docs/user`

### External Services
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Sentry Docs](https://docs.sentry.io)

### Repository
- GitHub: `https://github.com/your-org/grasshopper`
- Issues: `https://github.com/your-org/grasshopper/issues`

---

## ✅ POST-DEPLOYMENT CHECKLIST

After deployment, verify:

- [ ] Application is accessible
- [ ] SSL certificate is valid
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Payment processing works
- [ ] Emails are being sent
- [ ] Admin panel is accessible
- [ ] Error monitoring is active
- [ ] Database backups are running
- [ ] Performance is acceptable
- [ ] Security headers are set
- [ ] CORS is configured correctly
- [ ] Rate limiting is working
- [ ] Webhooks are receiving events
- [ ] Analytics are tracking

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

1. ✅ All health checks pass
2. ✅ Critical user flows work
3. ✅ No errors in Sentry
4. ✅ Performance metrics are good
5. ✅ Security scan passes
6. ✅ Backups are configured
7. ✅ Monitoring is active
8. ✅ Team is trained

---

## 📝 ROLLBACK PROCEDURE

If deployment fails:

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Database
```bash
# Restore from backup
npx supabase db reset
psql < backup-previous.sql
```

### DNS
- Update DNS records to previous deployment
- Wait for propagation (5-60 minutes)

---

**Deployment Guide Version:** 1.0  
**Platform Version:** 26.0.0  
**Last Verified:** November 6, 2025

**Status:** ✅ READY FOR PRODUCTION DEPLOYMENT

---

For questions or issues, contact the development team.

**END OF DEPLOYMENT GUIDE**
