# Vercel Deployment Setup for GVTEWAY

## Overview

GVTEWAY uses subdomain-based routing with two domains:
- **Main Domain**: `gvteway.com` (public pages)
- **App Subdomain**: `app.gvteway.com` (authenticated dashboards)

---

## Step 1: Add Domains in Vercel

### 1.1 Add Main Domain

1. Go to your Vercel project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `gvteway.com`
4. Click **Add**
5. Vercel will provide DNS records to configure

### 1.2 Add App Subdomain

1. In the same **Domains** section
2. Click **Add Domain**
3. Enter: `app.gvteway.com`
4. Click **Add**

### 1.3 Add WWW Redirect (Optional)

1. Click **Add Domain**
2. Enter: `www.gvteway.com`
3. Select **Redirect to gvteway.com**

---

## Step 2: Configure DNS Records

Go to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare) and add these DNS records:

### For Vercel Hosting

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     Auto
A       app     76.76.21.21                     Auto
CNAME   www     cname.vercel-dns.com            Auto
```

**Note:** Vercel will show you the exact IP addresses and CNAME values in the Domains section. Use those instead if different.

### Alternative: Using Vercel DNS (Recommended)

If you want Vercel to manage DNS:

1. In Vercel → **Domains** → Click on your domain
2. Click **Use Vercel Nameservers**
3. Update your domain registrar with Vercel's nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

---

## Step 3: Environment Variables

### 3.1 Add to Vercel

Go to **Settings** → **Environment Variables** and add:

#### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zunesxhsexrqjrroeass.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bmVzeGhzZXhycWpycm9lYXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjYxOTUsImV4cCI6MjA3ODMwMjE5NX0.w2CeSYD9zDsVcGEPlNfkurB_1aDhJsr_UGnDrNybU7U
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bmVzeGhzZXhycWpycm9lYXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcyNjE5NSwiZXhwIjoyMDc4MzAyMTk1fQ.qm9nFdzR4whVYlIpwSBxEAFc-MUjrOR4TryI5qJqzig

# App URLs (CRITICAL)
NEXT_PUBLIC_APP_URL=https://gvteway.com
NEXT_PUBLIC_APP_SUBDOMAIN_URL=https://app.gvteway.com
NEXT_PUBLIC_BRAND_NAME=GVTEWAY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Resend Email
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=noreply@gvteway.com

# Security
CSRF_SECRET=your_random_secret_min_32_chars
CRON_SECRET=your_random_cron_secret
```

#### Optional Variables

```bash
# Third-party Integrations
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
GOOGLE_PLACES_API_KEY=
YOUTUBE_API_KEY=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 3.2 Environment Scope

For each variable, select:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

---

## Step 4: Supabase Configuration

### 4.1 Update Supabase Auth URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update:
   - **Site URL**: `https://gvteway.com`
   - **Redirect URLs**: Add these:
     ```
     https://gvteway.com/auth/callback
     https://app.gvteway.com/auth/callback
     https://gvteway.com/**
     https://app.gvteway.com/**
     ```

### 4.2 Update CORS Settings

1. Go to **Settings** → **API**
2. Add to **CORS Allowed Origins**:
   ```
   https://gvteway.com
   https://app.gvteway.com
   https://www.gvteway.com
   ```

---

## Step 5: Deploy

### 5.1 Initial Deployment

```bash
# From your local machine
git push origin main
```

Vercel will automatically deploy when you push to main branch.

### 5.2 Verify Deployment

1. Check **Deployments** tab in Vercel
2. Wait for build to complete
3. Click **Visit** to test

### 5.3 Test Subdomain Routing

Test these URLs:

| URL | Expected Behavior |
|-----|-------------------|
| `https://gvteway.com` | Public homepage |
| `https://gvteway.com/events` | Public events page |
| `https://app.gvteway.com` | Redirect to appropriate dashboard based on role |
| `https://app.gvteway.com/organization` | Organization admin dashboard |
| `https://app.gvteway.com/member` | Member portal |

---

## Step 6: SSL/HTTPS

Vercel automatically provisions SSL certificates for all domains. This usually takes 1-5 minutes after DNS propagation.

**Check SSL Status:**
1. Go to **Domains** in Vercel
2. Each domain should show a green checkmark ✅
3. If not, click **Refresh** or wait for DNS propagation (up to 48 hours)

---

## Step 7: Database Migration

Run the new migration to add platform admin flag:

```bash
# Local
npx supabase db push

# Or via Supabase Dashboard
# Go to SQL Editor and run:
# /supabase/migrations/00057_add_platform_admin_flag.sql
```

---

## Step 8: Set Platform Admin

To grant Legend (platform admin) access to a user:

```sql
-- In Supabase SQL Editor
UPDATE user_profiles
SET is_platform_admin = TRUE
WHERE email = 'your-admin-email@example.com';
```

---

## Troubleshooting

### Domain Not Working

1. **Check DNS Propagation**: Use [whatsmydns.net](https://www.whatsmydns.net/)
2. **Verify DNS Records**: Ensure A records point to correct Vercel IPs
3. **Wait**: DNS can take up to 48 hours to propagate globally

### Subdomain Routing Not Working

1. **Check Environment Variables**: Ensure `NEXT_PUBLIC_APP_SUBDOMAIN_URL` is set
2. **Check Middleware**: Verify `/src/middleware.ts` is deployed
3. **Check Logs**: Go to Vercel → **Deployments** → Click deployment → **Functions** tab

### Authentication Issues

1. **Check Supabase URLs**: Verify redirect URLs include both domains
2. **Check CORS**: Ensure both domains are in CORS allowed origins
3. **Clear Cookies**: Try in incognito/private browsing mode

### Role-Based Routing Not Working

1. **Check Database**: Verify `is_platform_admin` column exists
2. **Check User Role**: Run SQL query to verify user has correct role
3. **Check Middleware Logs**: Look for errors in Vercel function logs

---

## Production Checklist

Before going live:

- [ ] DNS records configured and propagated
- [ ] SSL certificates active (green checkmarks in Vercel)
- [ ] All environment variables set in Vercel
- [ ] Supabase auth URLs updated
- [ ] Supabase CORS configured
- [ ] Database migration applied (`00057_add_platform_admin_flag.sql`)
- [ ] Platform admin user(s) configured
- [ ] Test all subdomain routes
- [ ] Test role-based routing for each user type
- [ ] Stripe webhook endpoint configured (if using Stripe)
- [ ] Email sending tested (Resend)
- [ ] Error monitoring configured (Sentry)

---

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard:
1. Go to **Analytics** tab
2. Click **Enable Analytics**

### Vercel Logs

View real-time logs:
1. Go to **Deployments**
2. Click on a deployment
3. Click **Functions** tab
4. View function logs for debugging

### Supabase Logs

1. Go to Supabase Dashboard → **Logs**
2. Monitor API requests, errors, and performance

---

## Cost Considerations

### Vercel Pricing

- **Hobby Plan** (Free): 100GB bandwidth, unlimited deployments
- **Pro Plan** ($20/mo): 1TB bandwidth, advanced analytics
- **Enterprise**: Custom pricing

### Supabase Pricing

- **Free Tier**: 500MB database, 2GB bandwidth
- **Pro Plan** ($25/mo): 8GB database, 250GB bandwidth
- **Enterprise**: Custom pricing

**Recommendation**: Start with free tiers, upgrade when needed.
