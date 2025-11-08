# Deployment Guide - Grasshopper 26.00

## Quick Start Deployment

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Stripe account
- Vercel account (recommended)
- Resend account (for emails)

## Step 1: Environment Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key
4. Go to Project Settings → API to find your service role key

### 1.2 Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 1.3 Set Up Stripe
1. Go to [stripe.com](https://stripe.com)
2. Create account or sign in
3. Get your publishable and secret keys from Dashboard → Developers → API keys
4. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
5. Note your webhook signing secret

### 1.4 Configure Resend
1. Go to [resend.com](https://resend.com)
2. Create account and verify domain
3. Get your API key from API Keys section

### 1.5 Environment Variables
Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=Grasshopper
```

## Step 2: Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

## Step 3: Deploy to Vercel

### 3.1 Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts to link project
# Add environment variables when prompted
```

### 3.2 Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
5. Add environment variables from `.env.local`
6. Click "Deploy"

### 3.3 Configure Custom Domain
1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

## Step 4: Post-Deployment Configuration

### 4.1 Update Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Update endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 4.2 Update Supabase Auth
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to Site URL
3. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/profile`

### 4.3 Configure OAuth Providers
For Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add credentials to Supabase Dashboard → Authentication → Providers

## Step 5: Seed Database (Optional)

Create sample data for testing:

```sql
-- Insert sample brand
INSERT INTO brands (name, slug, tagline, description)
VALUES ('Grasshopper', 'grasshopper', 'Experience Live Music', 'Premier live entertainment platform');

-- Insert sample event
INSERT INTO events (brand_id, name, slug, description, start_date, venue_name, status)
VALUES (
  (SELECT id FROM brands WHERE slug = 'grasshopper'),
  'Summer Music Festival 2025',
  'summer-music-festival-2025',
  'The biggest music festival of the year',
  '2025-07-15 18:00:00',
  'Central Park',
  'upcoming'
);

-- Insert sample artist
INSERT INTO artists (name, slug, bio, genre_tags)
VALUES (
  'DJ Example',
  'dj-example',
  'World-renowned electronic music artist',
  ARRAY['Electronic', 'House', 'Techno']
);
```

## Step 6: Testing

### 6.1 Test Authentication
- Sign up with email
- Sign in with email
- Test Google OAuth
- Test magic link

### 6.2 Test Event Pages
- Browse events
- View event details
- Check responsive design

### 6.3 Test Stripe Integration
- Add tickets to cart
- Complete checkout (use test card: 4242 4242 4242 4242)
- Verify webhook processing
- Check order confirmation

### 6.4 Test Admin Dashboard
- Create admin user in database
- Access `/admin/dashboard`
- Verify statistics display

## Step 7: Monitoring & Analytics

### 7.1 Vercel Analytics
- Automatically enabled on Vercel
- View in Vercel Dashboard → Analytics

### 7.2 Supabase Monitoring
- Database performance: Supabase Dashboard → Database
- Auth metrics: Supabase Dashboard → Authentication
- API usage: Supabase Dashboard → API

### 7.3 Stripe Dashboard
- Monitor payments and refunds
- View customer data
- Check webhook logs

## Step 8: Security Checklist

- ✅ All environment variables set
- ✅ RLS policies enabled on all tables
- ✅ Stripe webhook signature verification
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ CORS configured properly
- ✅ Rate limiting considered
- ✅ Admin routes protected

## Step 9: Performance Optimization

### 9.1 Enable Caching
Vercel automatically caches static assets and API routes.

### 9.2 Image Optimization
Next.js Image component handles optimization automatically.

### 9.3 Database Indexes
Ensure indexes are created (included in migrations):
```sql
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_artists_slug ON artists(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

## Step 10: Backup & Recovery

### 10.1 Database Backups
Supabase automatically backs up your database daily.

Manual backup:
```bash
# Export database
supabase db dump > backup.sql

# Restore database
supabase db reset
psql -h your-project.supabase.co -U postgres -d postgres < backup.sql
```

### 10.2 Code Backups
- Use Git for version control
- Push to GitHub/GitLab
- Vercel automatically deploys from Git

## Troubleshooting

### Issue: Build Fails
**Solution**: Check build logs in Vercel, ensure all dependencies are in `package.json`

### Issue: Database Connection Error
**Solution**: Verify Supabase URL and keys in environment variables

### Issue: Stripe Webhook Not Working
**Solution**: 
1. Check webhook URL is correct
2. Verify webhook secret
3. Check Stripe Dashboard → Webhooks → Logs

### Issue: Authentication Not Working
**Solution**:
1. Verify Supabase Auth configuration
2. Check redirect URLs
3. Ensure cookies are enabled

### Issue: Images Not Loading
**Solution**:
1. Check Supabase Storage bucket permissions
2. Verify image URLs are correct
3. Check CORS settings

## Maintenance

### Regular Tasks
- Monitor error logs (Vercel Dashboard)
- Review Stripe transactions
- Check database performance
- Update dependencies monthly
- Review and respond to user feedback

### Scaling Considerations
- Supabase: Upgrade plan as needed
- Vercel: Pro plan for production
- Stripe: No action needed (scales automatically)
- CDN: Vercel Edge Network handles this

## Support Resources

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Resend**: [resend.com/docs](https://resend.com/docs)

## Success Criteria

✅ Site loads in < 2 seconds  
✅ All pages responsive on mobile  
✅ Authentication works correctly  
✅ Payments process successfully  
✅ Emails deliver properly  
✅ Admin dashboard accessible  
✅ Search functionality works  
✅ No console errors  
✅ Lighthouse score > 90  

## Next Steps After Deployment

1. Add real event data
2. Upload artist profiles
3. Create ticket types and pricing
4. Set up email campaigns
5. Configure analytics tracking
6. Launch marketing campaigns
7. Monitor user feedback
8. Iterate and improve

---

**Congratulations!** Your Grasshopper platform is now live and ready to serve users.

For questions or issues, refer to the documentation or contact support.
