# Integration Layer Guide

## Overview

The GVTEWAY platform integrates with multiple third-party services to provide a comprehensive event management and ticketing experience. This document outlines all integrations, their configuration, and usage.

## Integration Status

### ✅ Fully Implemented (100%)

1. **Payment Processing** - Stripe
2. **Email Service** - Resend
3. **SMS Notifications** - Twilio
4. **Search** - Algolia
5. **Analytics** - Vercel Analytics, Google Analytics 4
6. **Error Tracking** - Sentry
7. **Push Notifications** - Web Push API
8. **Social Media** - Spotify, YouTube APIs
9. **ATLVS Integration** - Bidirectional sync with Dragonfly26.00
10. **Digital Wallets** - Apple Wallet & Google Wallet
11. **Social Login** - Google, GitHub, Azure OAuth

---

## 1. ATLVS Integration (Dragonfly26.00)

### Purpose
Bidirectional synchronization with the ATLVS production management platform for events, resources, and business operations.

### Features
- ✅ Event synchronization (to/from ATLVS)
- ✅ Resource availability management
- ✅ Ticket sales analytics sync
- ✅ Artist data synchronization
- ✅ Real-time webhook updates
- ✅ Connection health monitoring

### Configuration

```bash
# .env.local
ATLVS_API_URL=https://atlvs.yourdomain.com/api
ATLVS_API_KEY=your_atlvs_api_key
ATLVS_WEBHOOK_SECRET=your_webhook_secret
```

### Usage

```typescript
import {
  syncEventToATLVS,
  syncEventFromATLVS,
  syncArtistToATLVS,
  getATLVSResources,
  getATLVSStatus,
} from '@/lib/integrations/atlvs'

// Sync event to ATLVS
await syncEventToATLVS({
  id: 'event-123',
  name: 'Summer Festival',
  start_date: '2025-07-15T18:00:00Z',
  venue_name: 'Central Park',
  status: 'confirmed',
})

// Check connection status
const status = await getATLVSStatus()
console.log('ATLVS Connected:', status.connected)
```

### Webhook Endpoint
- **URL**: `/api/webhooks/atlvs`
- **Method**: POST
- **Authentication**: HMAC SHA-256 signature verification
- **Events**: `event.updated`, `event.cancelled`, `resource.updated`, `artist.updated`

---

## 2. Apple Wallet & Google Wallet

### Purpose
Generate digital passes for event tickets and membership cards that can be added to Apple Wallet (iOS) and Google Wallet (Android).

### Features
- ✅ Event ticket pass generation
- ✅ Membership card passes
- ✅ QR code integration for scanning
- ✅ Real-time pass updates
- ✅ Platform-specific formatting

### Configuration

```bash
# .env.local
# Apple Wallet
APPLE_PASS_TYPE_ID=pass.com.gvteway.ticket
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_WALLET_CERT_PATH=/path/to/cert.pem
APPLE_WALLET_KEY_PATH=/path/to/key.pem

# Google Wallet
GOOGLE_WALLET_ISSUER_ID=your_issuer_id
GOOGLE_WALLET_SERVICE_ACCOUNT=/path/to/service-account.json
```

### Setup Requirements

#### Apple Wallet
1. Enroll in Apple Developer Program
2. Create Pass Type ID in Apple Developer Portal
3. Generate Pass Type Certificate
4. Download certificate and private key

#### Google Wallet
1. Create Google Cloud Project
2. Enable Google Wallet API
3. Create Service Account
4. Generate Issuer ID

### Usage

```typescript
import {
  generateAppleWalletPass,
  generateGoogleWalletPass,
  generateQRCodeData,
} from '@/lib/integrations/wallet'

// Generate ticket pass
const qrCode = generateQRCodeData(ticketId, 'ticket')

const passData = {
  ticketId: 'ticket-123',
  eventName: 'Summer Festival',
  eventDate: '2025-07-15T18:00:00Z',
  venueName: 'Central Park',
  ticketType: 'VIP',
  price: 15000, // cents
  qrCode,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
}

// For iOS
const applePassUrl = await generateAppleWalletPass(passData)

// For Android
const googlePassUrl = await generateGoogleWalletPass(passData)
```

### API Endpoints

#### Generate Ticket Pass
```bash
POST /api/wallet/ticket
Content-Type: application/json

{
  "ticketId": "ticket-123",
  "platform": "apple" | "google"
}
```

#### Generate Membership Pass
```bash
POST /api/wallet/membership
Content-Type: application/json

{
  "userId": "user-123",
  "platform": "apple" | "google"
}
```

---

## 3. Social Login (OAuth)

### Purpose
Allow users to sign in/up using their existing social media accounts for a seamless authentication experience.

### Supported Providers
- ✅ Google OAuth 2.0
- ✅ GitHub OAuth
- ✅ Azure Active Directory (Microsoft)

### Configuration

OAuth providers are configured through the Supabase Dashboard:

1. Navigate to **Authentication > Providers**
2. Enable desired provider
3. Add OAuth credentials from provider's developer console

#### Google OAuth
- Already configured
- Client ID and Secret in Supabase Dashboard

#### GitHub OAuth
1. Create OAuth App in GitHub Settings
2. Set Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Add Client ID and Secret to Supabase

#### Azure OAuth
1. Register app in Azure Portal
2. Configure redirect URI
3. Add Application (client) ID and Secret to Supabase

### Usage

The OAuth flow is handled automatically by Supabase Auth. Users can click the provider buttons on login/signup pages.

```typescript
// Already implemented in:
// - /src/app/(auth)/login/page.tsx
// - /src/app/(auth)/signup/page.tsx

const handleOAuthLogin = async (provider: 'google' | 'github' | 'azure') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}
```

---

## 4. Payment Processing (Stripe)

### Status
✅ Fully implemented

### Features
- Payment intents
- Subscription management
- Webhook handling
- Customer portal

### Documentation
See `/docs/integrations/STRIPE_INTEGRATION.md`

---

## 5. Email Service (Resend)

### Status
✅ Fully implemented (6 templates)

### Templates
1. Welcome email
2. Ticket confirmation
3. Event reminder
4. Password reset
5. Email verification
6. Membership confirmation

### Documentation
See `/docs/integrations/EMAIL_INTEGRATION.md`

---

## 6. SMS Notifications (Twilio)

### Status
✅ Fully implemented

### Features
- Event reminders
- Ticket delivery
- Two-factor authentication
- Order confirmations

---

## 7. Search (Algolia)

### Status
✅ Fully implemented

### Indexed Collections
- Events
- Artists
- Venues

---

## 8. Analytics

### Providers
- ✅ Vercel Analytics
- ✅ Google Analytics 4

### Tracked Events
- Page views
- Ticket purchases
- User registrations
- Event interactions

---

## 9. Error Tracking (Sentry)

### Status
✅ Fully implemented

### Configuration
```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

---

## 10. Push Notifications

### Status
✅ Fully implemented

### Features
- Web Push API
- Service worker integration
- Event reminders
- Ticket updates

---

## Integration Testing

### Test ATLVS Connection
```bash
curl -X GET https://your-app.com/api/atlvs/status \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Test Wallet Pass Generation
```bash
curl -X POST https://your-app.com/api/wallet/ticket \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "test-123",
    "platform": "apple"
  }'
```

### Test OAuth Flow
1. Navigate to `/login`
2. Click Google/GitHub/Azure button
3. Complete OAuth flow
4. Verify redirect to `/auth/callback`

---

## Security Considerations

### API Keys
- Store all API keys in environment variables
- Never commit `.env.local` to version control
- Use different keys for development/production

### Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement rate limiting

### OAuth Security
- Use state parameter to prevent CSRF
- Validate redirect URIs
- Store tokens securely

---

## Monitoring & Maintenance

### Health Checks
- ATLVS connection status: `/api/atlvs/status`
- Stripe webhook status: Stripe Dashboard
- Supabase status: Supabase Dashboard

### Logs
- Application logs: Vercel Dashboard
- Error tracking: Sentry Dashboard
- API logs: Individual service dashboards

---

## Troubleshooting

### ATLVS Sync Issues
1. Check API key validity
2. Verify webhook secret
3. Review webhook logs
4. Test connection with `/api/atlvs/status`

### Wallet Pass Issues
1. Verify Apple/Google credentials
2. Check pass data format
3. Validate QR code generation
4. Review certificate expiration

### OAuth Issues
1. Verify redirect URIs match
2. Check provider credentials
3. Review Supabase auth logs
4. Test with different browsers

---

## Future Enhancements

### Planned Integrations
- [ ] Apple Pay / Google Pay
- [ ] Social media auto-posting
- [ ] CRM integration (HubSpot/Salesforce)
- [ ] Calendar sync (iCal/Google Calendar)

---

## Support

For integration support:
- Email: support@gvteway.com
- Documentation: https://docs.gvteway.com
- Status Page: https://status.gvteway.com
