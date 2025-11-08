/**
 * Advanced Search Service
 * Provides full-text search across events, artists, and content
 * Ready for Algolia/Typesense integration
 */

import { createClient } from '@/lib/supabase/server';

export interface SearchFilters {
  query?: string;
  type?: 'events' | 'artists' | 'content' | 'all';
  genres?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  status?: string[];
  brandId?: string;
}

export interface SearchResult {
  id: string;
  type: 'event' | 'artist' | 'content';
  title: string;
  description: string;
  image: string;
  url: string;
  metadata: Record<string, any>;
  score: number;
}

/**
 * PostgreSQL full-text search (current implementation)
 * Can be swapped with Algolia/Typesense for production
 */
export async function searchAll(filters: SearchFilters): Promise<SearchResult[]> {
  const supabase = await createClient();
  const results: SearchResult[] = [];

  // Search events
  if (!filters.type || filters.type === 'events' || filters.type === 'all') {
    const eventResults = await searchEvents(filters);
    results.push(...eventResults);
  }

  // Search artists
  if (!filters.type || filters.type === 'artists' || filters.type === 'all') {
    const artistResults = await searchArtists(filters);
    results.push(...artistResults);
  }

  // Search content
  if (!filters.type || filters.type === 'content' || filters.type === 'all') {
    const contentResults = await searchContent(filters);
    results.push(...contentResults);
  }

  // Sort by relevance score
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Search events with filters
 */
export async function searchEvents(filters: SearchFilters): Promise<SearchResult[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  // Apply filters
  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }

  if (filters.brandId) {
    query = query.eq('brand_id', filters.brandId);
  }

  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters.dateRange) {
    query = query
      .gte('start_date', filters.dateRange.start)
      .lte('start_date', filters.dateRange.end);
  }

  const { data, error } = await query.limit(20);

  if (error || !data) {
    console.error('Event search error:', error);
    return [];
  }

  return data.map((event) => ({
    id: event.id,
    type: 'event' as const,
    title: event.name,
    description: event.description || '',
    image: event.hero_image_url || '',
    url: `/events/${event.slug}`,
    metadata: {
      date: event.start_date,
      venue: event.venue_name,
      status: event.status,
    },
    score: calculateRelevanceScore(event.name, filters.query || ''),
  }));
}

/**
 * Search artists with filters
 */
export async function searchArtists(filters: SearchFilters): Promise<SearchResult[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true });

  // Apply filters
  if (filters.query) {
    query = query.or(`name.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`);
  }

  if (filters.genres && filters.genres.length > 0) {
    query = query.overlaps('genre_tags', filters.genres);
  }

  const { data, error } = await query.limit(20);

  if (error || !data) {
    console.error('Artist search error:', error);
    return [];
  }

  return data.map((artist) => ({
    id: artist.id,
    type: 'artist' as const,
    title: artist.name,
    description: artist.bio || '',
    image: artist.profile_image_url || '',
    url: `/artists/${artist.slug}`,
    metadata: {
      genres: artist.genre_tags,
      verified: artist.verified,
    },
    score: calculateRelevanceScore(artist.name, filters.query || ''),
  }));
}

/**
 * Search content posts with filters
 */
export async function searchContent(filters: SearchFilters): Promise<SearchResult[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('content_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Apply filters
  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%,excerpt.ilike.%${filters.query}%`);
  }

  if (filters.brandId) {
    query = query.eq('brand_id', filters.brandId);
  }

  const { data, error } = await query.limit(20);

  if (error || !data) {
    console.error('Content search error:', error);
    return [];
  }

  return data.map((post) => ({
    id: post.id,
    type: 'content' as const,
    title: post.title,
    description: post.excerpt || '',
    image: post.featured_image_url || '',
    url: `/news/${post.slug}`,
    metadata: {
      type: post.post_type,
      publishedAt: post.published_at,
      tags: post.tags,
    },
    score: calculateRelevanceScore(post.title, filters.query || ''),
  }));
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(text: string, query: string): number {
  if (!query) return 0.5;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match
  if (lowerText === lowerQuery) return 1.0;
  
  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 0.9;
  
  // Contains query
  if (lowerText.includes(lowerQuery)) return 0.7;
  
  // Word match
  const words = lowerQuery.split(' ');
  const matchCount = words.filter(word => lowerText.includes(word)).length;
  return matchCount / words.length * 0.5;
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
  const supabase = await createClient();
  
  const suggestions: string[] = [];

  // Get event suggestions
  const { data: events } = await supabase
    .from('events')
    .select('name')
    .ilike('name', `%${query}%`)
    .limit(limit);

  if (events) {
    suggestions.push(...events.map(e => e.name));
  }

  // Get artist suggestions
  const { data: artists } = await supabase
    .from('artists')
    .select('name')
    .ilike('name', `%${query}%`)
    .limit(limit);

  if (artists) {
    suggestions.push(...artists.map(a => a.name));
  }

  return [...new Set(suggestions)].slice(0, limit);
}

/**
 * Algolia Integration (Ready for plug-and-play)
 * Uncomment and configure when Algolia credentials are available
 */
/*
import algoliasearch from 'algoliasearch';

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_SEARCH_KEY!
);

export async function searchWithAlgolia(filters: SearchFilters): Promise<SearchResult[]> {
  const index = algoliaClient.initIndex('events_artists_content');
  
  const { hits } = await index.search(filters.query || '', {
    filters: buildAlgoliaFilters(filters),
    hitsPerPage: 20,
  });

  return hits.map((hit: any) => ({
    id: hit.objectID,
    type: hit.type,
    title: hit.title,
    description: hit.description,
    image: hit.image,
    url: hit.url,
    metadata: hit.metadata,
    score: hit._rankingInfo?.score || 0,
  }));
}

function buildAlgoliaFilters(filters: SearchFilters): string {
  const conditions: string[] = [];

  if (filters.type && filters.type !== 'all') {
    conditions.push(`type:${filters.type}`);
  }

  if (filters.genres && filters.genres.length > 0) {
    const genreFilters = filters.genres.map(g => `genres:${g}`).join(' OR ');
    conditions.push(`(${genreFilters})`);
  }

  if (filters.status && filters.status.length > 0) {
    const statusFilters = filters.status.map(s => `status:${s}`).join(' OR ');
    conditions.push(`(${statusFilters})`);
  }

  return conditions.join(' AND ');
}
*/

/**
 * Typesense Integration (Alternative to Algolia)
 * Uncomment and configure when Typesense is set up
 */
/*
import Typesense from 'typesense';

const typesenseClient = new Typesense.Client({
  nodes: [{
    host: process.env.TYPESENSE_HOST!,
    port: 443,
    protocol: 'https',
  }],
  apiKey: process.env.TYPESENSE_API_KEY!,
});

export async function searchWithTypesense(filters: SearchFilters): Promise<SearchResult[]> {
  const searchParameters = {
    q: filters.query || '*',
    query_by: 'title,description',
    filter_by: buildTypesenseFilters(filters),
    per_page: 20,
  };

  const results = await typesenseClient
    .collections('events_artists_content')
    .documents()
    .search(searchParameters);

  return results.hits?.map((hit: any) => ({
    id: hit.document.id,
    type: hit.document.type,
    title: hit.document.title,
    description: hit.document.description,
    image: hit.document.image,
    url: hit.document.url,
    metadata: hit.document.metadata,
    score: hit.text_match_info.score,
  })) || [];
}

function buildTypesenseFilters(filters: SearchFilters): string {
  const conditions: string[] = [];

  if (filters.type && filters.type !== 'all') {
    conditions.push(`type:=${filters.type}`);
  }

  if (filters.genres && filters.genres.length > 0) {
    conditions.push(`genres:=[${filters.genres.join(',')}]`);
  }

  return conditions.join(' && ');
}
*/
