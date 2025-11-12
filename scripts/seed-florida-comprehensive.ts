/**
 * Comprehensive Florida Data Seeding Script
 * Integrates: Spotify API + Google Places API + Scraped Demo Data
 * Seeds: 100+ Artists, 30+ Events, 250+ Adventures, 500+ Shops, 20+ News
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// API Keys
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Top 10 Florida Cities
const FL_CITIES = [
  { name: 'Jacksonville', lat: 30.3322, lng: -81.6557, pop: 1024310 },
  { name: 'Miami', lat: 25.7617, lng: -80.1918, pop: 467963 },
  { name: 'Tampa', lat: 27.9506, lng: -82.4572, pop: 403364 },
  { name: 'Orlando', lat: 28.5383, lng: -81.3792, pop: 316081 },
  { name: 'St. Petersburg', lat: 27.7676, lng: -82.6403, pop: 265098 },
  { name: 'Port St. Lucie', lat: 27.2730, lng: -80.3582, pop: 217523 },
  { name: 'Cape Coral', lat: 26.5629, lng: -81.9495, pop: 216926 },
  { name: 'Hialeah', lat: 25.8576, lng: -80.2781, pop: 223109 },
  { name: 'Tallahassee', lat: 30.4383, lng: -84.2807, pop: 201731 },
  { name: 'Fort Lauderdale', lat: 26.1224, lng: -80.1373, pop: 183109 },
];

// =============================================================================
// SPOTIFY API INTEGRATION
// =============================================================================

async function getSpotifyToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn('⚠️  Spotify credentials not found, using demo data');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Spotify auth error:', error);
    return null;
  }
}

async function fetchSpotifyArtists(token: string): Promise<any[]> {
  const artists: any[] = [];
  
  try {
    // Fetch Dance Music Rising playlist
    const playlistId = '37i9dQZF1DX4dyzvuaRJ0n'; // Dance Rising playlist
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const data = await response.json();
    
    data.items?.forEach((item: any) => {
      const artist = item.track?.artists?.[0];
      if (artist) {
        artists.push({
          name: artist.name,
          spotifyId: artist.id,
          genres: [],
        });
      }
    });

    // Fetch top artists from multiple genres
    const genres = ['pop', 'hip-hop', 'rock', 'electronic', 'country', 'latin'];
    
    for (const genre of genres) {
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=genre:${genre}&type=artist&limit=20`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const searchData = await searchResponse.json();
      
      searchData.artists?.items?.forEach((artist: any) => {
        if (!artists.find(a => a.spotifyId === artist.id)) {
          artists.push({
            name: artist.name,
            spotifyId: artist.id,
            genres: artist.genres || [],
          });
        }
      });
    }
  } catch (error) {
    console.error('Spotify fetch error:', error);
  }

  return artists.slice(0, 150); // Limit to 150 artists
}

// =============================================================================
// GOOGLE PLACES API INTEGRATION
// =============================================================================

async function fetchGooglePlaces(city: typeof FL_CITIES[0], category: string): Promise<any[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('⚠️  Google Places API key not found, using demo data');
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
      `query=${category}+in+${city.name}+Florida&` +
      `key=${GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();
    
    return (data.results || [])
      .filter((place: any) => place.rating >= 4.0)
      .slice(0, 10)
      .map((place: any) => ({
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        types: place.types,
      }));
  } catch (error) {
    console.error('Google Places error:', error);
    return [];
  }
}

// =============================================================================
// DEMO DATA (Scraped/Curated)
// =============================================================================

const DEMO_ARTISTS = [
  { name: 'Taylor Swift', genres: ['Pop', 'Country'] },
  { name: 'Bad Bunny', genres: ['Latin', 'Reggaeton'] },
  { name: 'Drake', genres: ['Hip Hop', 'R&B'] },
  { name: 'The Weeknd', genres: ['R&B', 'Pop'] },
  { name: 'SZA', genres: ['R&B', 'Soul'] },
  { name: 'Morgan Wallen', genres: ['Country'] },
  { name: 'Olivia Rodrigo', genres: ['Pop', 'Rock'] },
  { name: 'Doja Cat', genres: ['Pop', 'Hip Hop'] },
  { name: 'Billie Eilish', genres: ['Pop', 'Alternative'] },
  { name: 'Ariana Grande', genres: ['Pop', 'R&B'] },
  { name: 'Post Malone', genres: ['Hip Hop', 'Pop', 'Rock'] },
  { name: 'Kendrick Lamar', genres: ['Hip Hop'] },
  { name: 'Harry Styles', genres: ['Pop', 'Rock'] },
  { name: 'Dua Lipa', genres: ['Pop', 'Dance'] },
  { name: 'Travis Scott', genres: ['Hip Hop', 'Trap'] },
  { name: 'Sabrina Carpenter', genres: ['Pop'] },
  { name: 'Tyler The Creator', genres: ['Hip Hop', 'Alternative'] },
  { name: 'Lana Del Rey', genres: ['Alternative', 'Pop'] },
  { name: 'Bruno Mars', genres: ['Pop', 'Funk', 'R&B'] },
  { name: 'Ed Sheeran', genres: ['Pop', 'Folk'] },
  // Dance/Electronic
  { name: 'Calvin Harris', genres: ['EDM', 'House'] },
  { name: 'David Guetta', genres: ['House', 'EDM'] },
  { name: 'Marshmello', genres: ['EDM', 'Future Bass'] },
  { name: 'Tiësto', genres: ['Trance', 'House'] },
  { name: 'Zedd', genres: ['Electro House'] },
  { name: 'Diplo', genres: ['EDM', 'Trap'] },
  { name: 'Skrillex', genres: ['Dubstep', 'EDM'] },
  { name: 'Martin Garrix', genres: ['Big Room', 'House'] },
  { name: 'Kygo', genres: ['Tropical House'] },
  { name: 'Illenium', genres: ['Melodic Bass'] },
  { name: 'Fisher', genres: ['Tech House'] },
  { name: 'Disclosure', genres: ['House', 'UK Garage'] },
  { name: 'ODESZA', genres: ['Electronic', 'Indie Dance'] },
  { name: 'Flume', genres: ['Future Bass'] },
  { name: 'Porter Robinson', genres: ['Electronic'] },
  { name: 'Rezz', genres: ['Techno', 'Bass'] },
  { name: 'Gryffin', genres: ['Melodic House'] },
  { name: 'Alesso', genres: ['Progressive House'] },
  { name: 'RL Grime', genres: ['Trap', 'Bass'] },
  { name: 'Madeon', genres: ['Electronic', 'Synth Pop'] },
];

const DEMO_EVENTS = [
  {
    name: 'Okeechobee Music Festival 2026',
    venue: 'Sunshine Grove',
    city: 'Okeechobee',
    date: '2026-03-05',
    type: 'festival',
  },
  {
    name: 'III Points Festival 2026',
    venue: 'Mana Wynwood',
    city: 'Miami',
    date: '2026-10-16',
    type: 'festival',
  },
  {
    name: 'Gasparilla Music Festival 2026',
    venue: 'Curtis Hixon Waterfront Park',
    city: 'Tampa',
    date: '2026-03-07',
    type: 'festival',
  },
  {
    name: 'Suwannee Hulaween 2026',
    venue: 'Spirit of the Suwannee Music Park',
    city: 'Live Oak',
    date: '2026-10-29',
    type: 'festival',
  },
  {
    name: 'Tortuga Music Festival 2026',
    venue: 'Fort Lauderdale Beach Park',
    city: 'Fort Lauderdale',
    date: '2026-04-10',
    type: 'festival',
  },
  {
    name: 'Jacksonville Jazz Festival 2026',
    venue: 'Downtown Jacksonville',
    city: 'Jacksonville',
    date: '2026-05-22',
    type: 'festival',
  },
  {
    name: 'Sunset Music Festival 2026',
    venue: 'Raymond James Stadium',
    city: 'Tampa',
    date: '2026-05-23',
    type: 'festival',
  },
];

const DEMO_ADVENTURES_TEMPLATES = [
  { type: 'kayaking', name: 'Kayaking Adventure', price: 55, difficulty: 'moderate' },
  { type: 'tours', name: 'City Walking Tour', price: 35, difficulty: 'easy' },
  { type: 'water', name: 'Beach Day Experience', price: 0, difficulty: 'easy' },
  { type: 'hiking', name: 'Nature Trail Hike', price: 15, difficulty: 'moderate' },
  { type: 'tours', name: 'Food & Culture Tour', price: 75, difficulty: 'easy' },
  { type: 'water', name: 'Snorkeling Excursion', price: 85, difficulty: 'moderate' },
  { type: 'biking', name: 'Bike Tour', price: 45, difficulty: 'easy' },
  { type: 'tours', name: 'Historic District Tour', price: 30, difficulty: 'easy' },
  { type: 'water', name: 'Paddleboard Rental', price: 40, difficulty: 'easy' },
  { type: 'experiences', name: 'Sunset Cruise', price: 95, difficulty: 'easy' },
  { type: 'tours', name: 'Art Gallery Walk', price: 25, difficulty: 'easy' },
  { type: 'water', name: 'Fishing Charter', price: 150, difficulty: 'moderate' },
  { type: 'experiences', name: 'Cooking Class', price: 85, difficulty: 'easy' },
  { type: 'tours', name: 'Brewery Tour', price: 50, difficulty: 'easy' },
  { type: 'hiking', name: 'State Park Exploration', price: 10, difficulty: 'moderate' },
  { type: 'water', name: 'Jet Ski Rental', price: 120, difficulty: 'moderate' },
  { type: 'experiences', name: 'Wine Tasting', price: 65, difficulty: 'easy' },
  { type: 'tours', name: 'Ghost Tour', price: 35, difficulty: 'easy' },
  { type: 'water', name: 'Dolphin Watch', price: 70, difficulty: 'easy' },
  { type: 'experiences', name: 'Spa Day', price: 150, difficulty: 'easy' },
  { type: 'tours', name: 'Architecture Tour', price: 40, difficulty: 'easy' },
  { type: 'water', name: 'Scuba Diving', price: 180, difficulty: 'challenging' },
  { type: 'experiences', name: 'Yoga on the Beach', price: 25, difficulty: 'easy' },
  { type: 'tours', name: 'Street Art Tour', price: 30, difficulty: 'easy' },
  { type: 'water', name: 'Boat Rental', price: 200, difficulty: 'moderate' },
];

const DEMO_SHOP_CATEGORIES = [
  'boutique', 'art gallery', 'music store', 'gift shop', 'jewelry', 
  'vintage', 'home decor', 'bookstore', 'craft store', 'specialty food',
  'coffee shop', 'tea house', 'chocolate shop', 'candle shop', 'plant shop',
  'record store', 'antique shop', 'souvenir shop', 'perfume shop', 'wellness',
];

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

async function seedArtists() {
  console.log('\n🎵 Seeding Artists...');
  
  let artists = [...DEMO_ARTISTS];
  
  // Try to fetch from Spotify
  const spotifyToken = await getSpotifyToken();
  if (spotifyToken) {
    console.log('✓ Fetching from Spotify API...');
    const spotifyArtists = await fetchSpotifyArtists(spotifyToken);
    artists = [...artists, ...spotifyArtists];
  }

  // Remove duplicates
  const uniqueArtists = Array.from(
    new Map(artists.map(a => [a.name.toLowerCase(), a])).values()
  );

  const artistData = uniqueArtists.slice(0, 120).map((artist) => ({
    name: artist.name,
    slug: artist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    bio: `${artist.name} - ${artist.genres.join(', ')} artist`,
    genre_tags: artist.genres,
    profile_image_url: `/artists/${artist.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    verified: Math.random() > 0.3,
  }));

  const { error } = await supabase.from('artists').upsert(artistData, { onConflict: 'slug' });
  if (error) console.error('❌ Artist seed error:', error);
  else console.log(`✅ Seeded ${artistData.length} artists`);
}

async function seedEvents() {
  console.log('\n🎤 Seeding Events...');
  
  const events = [];
  
  for (const event of DEMO_EVENTS) {
    const city = FL_CITIES.find(c => c.name === event.city) || FL_CITIES[0];
    
    events.push({
      name: event.name,
      slug: event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: `Independent ${event.type} in ${event.city}, Florida`,
      event_type: event.type,
      start_date: new Date(event.date).toISOString(),
      end_date: new Date(new Date(event.date).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: event.venue,
      venue_address: JSON.stringify({ city: event.city, state: 'FL' }),
      age_restriction: event.type === 'festival' ? '18+' : 'All Ages',
      capacity: event.type === 'festival' ? 25000 : 1500,
      status: 'upcoming',
      hero_image_url: `/events/${event.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    });
  }

  // Add more concert dates across 2026-2027
  const venues = [
    { name: 'The Beacham', city: 'Orlando', capacity: 1200 },
    { name: 'Jannus Live', city: 'St. Petersburg', capacity: 2000 },
    { name: 'Revolution Live', city: 'Fort Lauderdale', capacity: 1200 },
    { name: 'The Ritz Ybor', city: 'Tampa', capacity: 1500 },
    { name: 'Jack Rabbits', city: 'Jacksonville', capacity: 400 },
    { name: 'Space Park', city: 'Miami', capacity: 3000 },
  ];

  const startDate = new Date('2025-12-01');
  const endDate = new Date('2027-12-31');
  
  for (let i = 0; i < 25; i++) {
    const venue = venues[i % venues.length];
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    
    events.push({
      name: `${venue.name} Concert ${i + 1}`,
      slug: `${venue.name.toLowerCase().replace(/\s+/g, '-')}-concert-${i + 1}`,
      description: `Live music at ${venue.name}`,
      event_type: 'concert',
      start_date: randomDate.toISOString(),
      end_date: new Date(randomDate.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      venue_name: venue.name,
      venue_address: JSON.stringify({ city: venue.city, state: 'FL' }),
      age_restriction: '18+',
      capacity: venue.capacity,
      status: randomDate > new Date() ? 'upcoming' : 'past',
      hero_image_url: `/events/concert-${i + 1}.jpg`,
    });
  }

  const { error } = await supabase.from('events').upsert(events, { onConflict: 'slug' });
  if (error) console.error('❌ Event seed error:', error);
  else console.log(`✅ Seeded ${events.length} events`);
}

async function seedAdventures() {
  console.log('\n🏖️  Seeding Adventures...');
  
  const adventures = [];
  
  for (const city of FL_CITIES) {
    for (const template of DEMO_ADVENTURES_TEMPLATES) {
      adventures.push({
        name: `${city.name} ${template.name}`,
        slug: `${city.name.toLowerCase()}-${template.name.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-'),
        description: `Experience ${template.name.toLowerCase()} in ${city.name}`,
        adventure_type: template.type,
        location_name: `${city.name} Area`,
        location_coordinates: `(${city.lng},${city.lat})`,
        city: city.name,
        state: 'FL',
        price_range: template.price === 0 ? '$' : template.price < 50 ? '$$' : template.price < 100 ? '$$$' : '$$$$',
        min_price: template.price,
        max_price: template.price * 1.5,
        duration_hours: 2.5,
        difficulty_level: template.difficulty,
        status: 'active',
        featured: Math.random() > 0.8,
        hero_image_url: `/adventures/${template.type}.jpg`,
        tags: [template.type, 'outdoor', 'experience'],
      });
    }
  }

  const { error } = await supabase.from('adventures').upsert(adventures, { onConflict: 'slug' });
  if (error) console.error('❌ Adventure seed error:', error);
  else console.log(`✅ Seeded ${adventures.length} adventures`);
}

async function seedShops() {
  console.log('\n🛍️  Seeding Shops...');
  
  const shops = [];
  
  for (const city of FL_CITIES) {
    // Try Google Places API first
    if (GOOGLE_PLACES_API_KEY) {
      console.log(`  Fetching shops for ${city.name}...`);
      for (const category of DEMO_SHOP_CATEGORIES.slice(0, 5)) {
        const places = await fetchGooglePlaces(city, category);
        places.forEach(place => {
          shops.push({
            name: place.name,
            slug: `${place.name.toLowerCase()}-${city.name.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-'),
            description: `${category} in ${city.name}`,
            category: category,
            price: '$$',
            image_url: `/shops/${category.replace(/\s+/g, '-')}.jpg`,
            status: 'active',
          });
        });
        
        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Fill with demo data
    for (let i: number = shops.filter(s => s.slug.includes(city.name.toLowerCase())).length; i < 50; i++) {
      const category: string = DEMO_SHOP_CATEGORIES[i % DEMO_SHOP_CATEGORIES.length];
      shops.push({
        name: `${city.name} ${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
        slug: `${city.name.toLowerCase()}-${category.replace(/\s+/g, '-')}-${i + 1}`,
        description: `Local ${category} in ${city.name}`,
        category: category,
        price: '$$',
        image_url: `/shops/${category.replace(/\s+/g, '-')}.jpg`,
        status: 'active',
      });
    }
  }

  const { error } = await supabase.from('products').upsert(shops.slice(0, 500), { onConflict: 'slug' });
  if (error) console.error('❌ Shop seed error:', error);
  else console.log(`✅ Seeded ${Math.min(shops.length, 500)} shops`);
}

async function seedNews() {
  console.log('\n📰 Seeding News...');
  
  const news = [
    { title: 'Miami Music Scene Thrives with New Venues', category: 'Music' },
    { title: 'Orlando Becomes Hub for Electronic Music', category: 'Culture' },
    { title: 'Tampa Bay Festival Season Kicks Off', category: 'Festivals' },
    { title: 'Jacksonville Jazz Scene Grows', category: 'Music' },
    { title: 'Fort Lauderdale Beach Concerts Return', category: 'Events' },
    { title: 'St. Petersburg Arts District Expands', category: 'Culture' },
    { title: 'New Independent Venues Open Across Florida', category: 'Venues' },
    { title: 'Florida Artists Gain National Recognition', category: 'Music' },
    { title: 'Summer Festival Lineup Announced', category: 'Festivals' },
    { title: 'Local Music Education Programs Expand', category: 'Culture' },
    { title: 'Sustainable Event Practices Adopted Statewide', category: 'Business' },
    { title: 'Emerging Artists Showcase Series Launches', category: 'Music' },
    { title: 'Florida Music Industry Report Shows Growth', category: 'Business' },
    { title: 'New Concert Series at Waterfront Parks', category: 'Events' },
    { title: 'Historic Venues Undergo Renovations', category: 'Venues' },
    { title: 'Florida Festivals Set Attendance Records', category: 'Festivals' },
    { title: 'Local Artists Collaborate on New Projects', category: 'Music' },
    { title: 'Music Tourism Boosts Florida Economy', category: 'Business' },
    { title: 'Free Community Concerts Announced', category: 'Events' },
    { title: 'Florida Music Hall of Fame Inductees', category: 'Culture' },
  ];

  const newsData = news.map((item, i) => ({
    title: item.title,
    slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    excerpt: `${item.title} - Latest updates from Florida's music and entertainment scene`,
    content: `Full article content about ${item.title.toLowerCase()}...`,
    image_url: `/news/article-${i + 1}.jpg`,
    category: item.category,
    author: ['Sarah Martinez', 'Michael Chen', 'Jessica Williams'][i % 3],
    published: true,
    published_at: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { error } = await supabase.from('news_articles').upsert(newsData, { onConflict: 'slug' });
  if (error) console.error('❌ News seed error:', error);
  else console.log(`✅ Seeded ${newsData.length} news articles`);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('🌴 Starting Comprehensive Florida Data Seeding...');
  console.log('================================================\n');
  
  // Clean old demo data
  console.log('🧹 Cleaning old demo data...');
  await supabase.from('event_artists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('artists').delete().like('slug', '%-%');
  await supabase.from('events').delete().like('slug', '%-%');
  await supabase.from('adventures').delete().like('slug', '%-%');
  await supabase.from('news_articles').delete().like('slug', '%-%');
  console.log('✓ Cleanup complete\n');
  
  await seedArtists();
  await seedEvents();
  await seedAdventures();
  await seedShops();
  await seedNews();
  
  console.log('\n================================================');
  console.log('✅ Florida Data Seeding Complete!');
  console.log('================================================');
  console.log('\n📊 Summary:');
  console.log('  • 120+ Artists (Spotify + Demo)');
  console.log('  • 32+ Events (Festivals + Concerts)');
  console.log('  • 250 Adventures (25 per city × 10 cities)');
  console.log('  • 500 Shops (50 per city × 10 cities)');
  console.log('  • 20 News Articles');
  console.log('\n🎯 Ready for testing and demo!');
}

main().catch(console.error);
