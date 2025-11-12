# Florida Data Seeding Guide

## Overview
Comprehensive seeding script that populates GVTEWAY with Florida-focused demo data using Spotify API, Google Places API, and curated demo data.

## Data Seeded
- **120+ Artists** (Spotify API + Demo)
- **32+ Events** (Festivals + Concerts, Dec 2025 - Dec 2027)
- **250 Adventures** (25 per city × 10 cities)
- **500 Shops** (50 per city × 10 cities, 4+ star rating)
- **20 News Articles**

## Setup

### 1. Environment Variables
Add to your `.env.local`:

```bash
# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zunesxhsexrqjrroeass.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Spotify API (for real artist data)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Optional: Google Places API (for real shop data)
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### 2. Get API Keys

**Spotify (Free):**
1. Go to https://developer.spotify.com/dashboard
2. Create an app
3. Copy Client ID and Client Secret

**Google Places (Free $200/month credit):**
1. Go to https://console.cloud.google.com
2. Enable Places API
3. Create API key
4. Copy API key

## Usage

### Apply Migrations First
```bash
npm run db:migrate
```

### Run Seeding Script
```bash
npm run seed:florida
```

### What Happens
1. **Cleans** old demo data
2. **Fetches** artists from Spotify (if configured)
3. **Fetches** shops from Google Places (if configured)
4. **Seeds** curated demo data for events, adventures, news
5. **Outputs** summary of seeded data

## Without API Keys
Script works without API keys - it will use comprehensive demo data instead. You'll see warnings but seeding will complete successfully.

## Data Coverage

### Top 10 Florida Cities
- Jacksonville
- Miami  
- Tampa
- Orlando
- St. Petersburg
- Port St. Lucie
- Cape Coral
- Hialeah
- Tallahassee
- Fort Lauderdale

### Event Types
- Independent festivals (no LiveNation/Insomniac/Ultra)
- Concerts at local venues
- Multi-genre events
- Dates: December 2025 - December 2027

### Adventure Types
- Kayaking, hiking, biking
- Tours (food, city, historic, ghost)
- Water activities (beach, snorkeling, paddleboard)
- Experiences (cooking, wine tasting, spa)

### Shop Categories
- Boutiques, art galleries, music stores
- Gift shops, jewelry, vintage
- Specialty food, coffee, tea
- Home decor, books, crafts
- All 4+ star Google rating

## Testing
After seeding, test functionality:
- Browse artists on /music
- View events on /events
- Explore adventures on /adventures (with geolocation)
- Shop local on /shop
- Read news on /news

## Troubleshooting

**"Spotify credentials not found"**
- Normal if you haven't set up Spotify API
- Script will use demo artist data

**"Google Places API key not found"**
- Normal if you haven't set up Google Places
- Script will use demo shop data

**Database errors**
- Ensure migrations are applied: `npm run db:migrate`
- Check Supabase credentials in `.env.local`

**Rate limiting**
- Google Places has delays built in (200ms between requests)
- Spotify has generous free tier limits
