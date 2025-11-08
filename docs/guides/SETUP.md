# Grasshopper 26.00 - Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))
- Stripe account ([stripe.com](https://stripe.com))
- Resend account for emails ([resend.com](https://resend.com))

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Run the database migration:

```bash
# Initialize Supabase locally (optional)
npx supabase init

# Link to your project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push
```

Or manually run the SQL from `supabase/migrations/20250106_initial_schema.sql` in the Supabase SQL Editor.

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard > Developers > API keys
3. Set up a webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
     - `charge.refunded`
4. Copy the webhook signing secret

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in all the required values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=Your Brand Name

# ATLVS Integration (Dragonfly26.00)
ATLVS_API_URL=http://localhost:3000/api
ATLVS_API_KEY=your_atlvs_api_key
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## ATLVS (Dragonfly26.00) Integration

Grasshopper integrates with ATLVS for production management:

### Setup Integration

1. Ensure Dragonfly26.00 is running
2. Generate an API key in ATLVS admin panel
3. Add the API key to your `.env.local`:

```env
ATLVS_API_URL=http://localhost:3000/api
ATLVS_API_KEY=your_generated_key
```

### Integration Features

- **Event Sync**: Automatically sync events to ATLVS production system
- **Resource Management**: Access ATLVS resources for event planning
- **Sales Analytics**: Sync ticket sales data for cross-platform insights
- **Business Intelligence**: Get analytics from ATLVS

### Usage Example

```typescript
import { syncEventToATLVS } from '@/lib/integrations/atlvs'

// Sync event to ATLVS
await syncEventToATLVS({
  id: event.id,
  name: event.name,
  start_date: event.start_date,
  end_date: event.end_date,
  venue_name: event.venue_name,
  status: event.status,
})
```

## Database Schema

The platform includes comprehensive database schemas for:

- **Brands**: Multi-tenancy support
- **Events**: Festivals, concerts, club nights
- **Artists**: Performer directory
- **Tickets**: Ticketing system with QR codes
- **Orders**: Payment processing
- **Products**: Merchandise store
- **Content**: Blog/news system
- **User Profiles**: User management

See `supabase/migrations/20250106_initial_schema.sql` for full schema.

## API Routes

### Public APIs

- `GET /api/events` - List events
- `GET /api/artists` - List artists

### Protected APIs

- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Supabase credentials
- Stripe keys (use production keys)
- Resend API key
- ATLVS integration credentials

## Troubleshooting

### Database Connection Issues

- Verify Supabase URL and keys
- Check if RLS policies are enabled
- Ensure migrations ran successfully

### Stripe Webhook Issues

- Verify webhook secret
- Check webhook endpoint is publicly accessible
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### ATLVS Integration Issues

- Ensure Dragonfly26.00 is running
- Verify API key is correct
- Check network connectivity between services

## Next Steps

1. Customize branding in `src/app/globals.css`
2. Add your first event via Supabase dashboard
3. Create artist profiles
4. Set up Stripe products for tickets
5. Configure email templates in Resend
6. Test the complete checkout flow

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review the code examples
- Consult the ATLVS integration guide

---

**Built for world-class entertainment experiences** 🎉
