/**
 * Algolia Search Client
 * Advanced search functionality with typo-tolerance and faceted filtering
 */

import algoliasearch from 'algoliasearch';

// Initialize Algolia client
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';
const adminApiKey = process.env.ALGOLIA_ADMIN_KEY || '';

export const searchClient = algoliasearch(appId, searchApiKey);
export const adminClient = algoliasearch(appId, adminApiKey);

// Index names
export const INDICES = {
  EVENTS: 'events',
  ARTISTS: 'artists',
  PRODUCTS: 'products',
  CONTENT: 'content',
} as const;

/**
 * Check if Algolia is configured
 */
export function isAlgoliaConfigured(): boolean {
  return !!(appId && searchApiKey);
}

/**
 * Initialize Algolia indices with proper settings
 */
export async function initializeIndices() {
  if (!adminApiKey) {
    throw new Error('ALGOLIA_ADMIN_KEY is required for index initialization');
  }

  // Events index
  const eventsIndex = adminClient.initIndex(INDICES.EVENTS);
  await eventsIndex.setSettings({
    searchableAttributes: [
      'name',
      'description',
      'venue_name',
      'artists',
      'tags',
    ],
    attributesForFaceting: [
      'searchable(event_type)',
      'searchable(status)',
      'searchable(venue_name)',
      'filterOnly(brand_id)',
      'filterOnly(start_date)',
    ],
    customRanking: ['desc(start_date)', 'desc(popularity)'],
    ranking: [
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom',
    ],
  });

  // Artists index
  const artistsIndex = adminClient.initIndex(INDICES.ARTISTS);
  await artistsIndex.setSettings({
    searchableAttributes: ['name', 'bio', 'genre_tags'],
    attributesForFaceting: [
      'searchable(genre_tags)',
      'filterOnly(verified)',
    ],
    customRanking: ['desc(verified)', 'desc(popularity)'],
  });

  // Products index
  const productsIndex = adminClient.initIndex(INDICES.PRODUCTS);
  await productsIndex.setSettings({
    searchableAttributes: ['name', 'description', 'category'],
    attributesForFaceting: [
      'searchable(category)',
      'filterOnly(brand_id)',
      'filterOnly(event_id)',
      'price',
    ],
    customRanking: ['desc(created_at)'],
  });

  // Content index
  const contentIndex = adminClient.initIndex(INDICES.CONTENT);
  await contentIndex.setSettings({
    searchableAttributes: ['title', 'content', 'excerpt', 'tags'],
    attributesForFaceting: [
      'searchable(post_type)',
      'searchable(tags)',
      'filterOnly(brand_id)',
      'filterOnly(status)',
    ],
    customRanking: ['desc(published_at)'],
  });

  return {
    events: eventsIndex,
    artists: artistsIndex,
    products: productsIndex,
    content: contentIndex,
  };
}

/**
 * Sync event to Algolia
 */
export async function syncEventToAlgolia(event: any) {
  if (!isAlgoliaConfigured()) return;

  const index = searchClient.initIndex(INDICES.EVENTS);
  
  const record = {
    objectID: event.id,
    name: event.name,
    slug: event.slug,
    description: event.description,
    event_type: event.event_type,
    start_date: new Date(event.start_date).getTime(),
    end_date: event.end_date ? new Date(event.end_date).getTime() : null,
    venue_name: event.venue_name,
    status: event.status,
    brand_id: event.brand_id,
    hero_image_url: event.hero_image_url,
    artists: event.artists || [],
    tags: event.metadata?.tags || [],
    popularity: event.metadata?.popularity || 0,
  };

  await index.saveObject(record);
}

/**
 * Sync artist to Algolia
 */
export async function syncArtistToAlgolia(artist: any) {
  if (!isAlgoliaConfigured()) return;

  const index = searchClient.initIndex(INDICES.ARTISTS);
  
  const record = {
    objectID: artist.id,
    name: artist.name,
    slug: artist.slug,
    bio: artist.bio,
    genre_tags: artist.genre_tags || [],
    profile_image_url: artist.profile_image_url,
    verified: artist.verified,
    popularity: artist.metadata?.popularity || 0,
  };

  await index.saveObject(record);
}

/**
 * Sync product to Algolia
 */
export async function syncProductToAlgolia(product: any) {
  if (!isAlgoliaConfigured()) return;

  const index = searchClient.initIndex(INDICES.PRODUCTS);
  
  const record = {
    objectID: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    base_price: parseFloat(product.base_price),
    brand_id: product.brand_id,
    event_id: product.event_id,
    images: product.images || [],
    status: product.status,
  };

  await index.saveObject(record);
}

/**
 * Sync content post to Algolia
 */
export async function syncContentToAlgolia(post: any) {
  if (!isAlgoliaConfigured()) return;

  const index = searchClient.initIndex(INDICES.CONTENT);
  
  const record = {
    objectID: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    post_type: post.post_type,
    tags: post.tags || [],
    brand_id: post.brand_id,
    status: post.status,
    published_at: post.published_at ? new Date(post.published_at).getTime() : null,
    featured_image_url: post.featured_image_url,
  };

  await index.saveObject(record);
}

/**
 * Delete from Algolia
 */
export async function deleteFromAlgolia(indexName: string, objectId: string) {
  if (!isAlgoliaConfigured()) return;

  const index = searchClient.initIndex(indexName);
  await index.deleteObject(objectId);
}

/**
 * Batch sync to Algolia
 */
export async function batchSyncToAlgolia(indexName: string, records: any[]) {
  if (!isAlgoliaConfigured()) return;

  const index = searchClient.initIndex(indexName);
  await index.saveObjects(records);
}

/**
 * Clear index
 */
export async function clearIndex(indexName: string) {
  if (!isAlgoliaConfigured()) return;

  const index = adminClient.initIndex(indexName);
  await index.clearObjects();
}

/**
 * Search across all indices
 */
export async function multiIndexSearch(query: string, options: {
  filters?: string;
  hitsPerPage?: number;
} = {}) {
  if (!isAlgoliaConfigured()) {
    return {
      events: [],
      artists: [],
      products: [],
      content: [],
    };
  }

  const queries = [
    {
      indexName: INDICES.EVENTS,
      query,
      params: {
        hitsPerPage: options.hitsPerPage || 5,
        filters: options.filters,
      },
    },
    {
      indexName: INDICES.ARTISTS,
      query,
      params: {
        hitsPerPage: options.hitsPerPage || 5,
        filters: options.filters,
      },
    },
    {
      indexName: INDICES.PRODUCTS,
      query,
      params: {
        hitsPerPage: options.hitsPerPage || 5,
        filters: options.filters,
      },
    },
    {
      indexName: INDICES.CONTENT,
      query,
      params: {
        hitsPerPage: options.hitsPerPage || 5,
        filters: options.filters,
      },
    },
  ];

  const { results } = await searchClient.multipleQueries(queries);

  return {
    events: 'hits' in results[0] ? results[0].hits : [],
    artists: 'hits' in results[1] ? results[1].hits : [],
    products: 'hits' in results[2] ? results[2].hits : [],
    content: 'hits' in results[3] ? results[3].hits : [],
  };
}

/**
 * Get search analytics
 */
export async function getSearchAnalytics(indexName: string) {
  if (!adminApiKey) {
    throw new Error('ALGOLIA_ADMIN_KEY is required for analytics');
  }

  // Note: Analytics methods are not available in the current Algolia client version
  // These would need to be accessed via the Algolia Analytics API directly
  const topSearches: any[] = [];
  const noResultSearches: any[] = [];

  return {
    topSearches,
    noResultSearches,
  };
}
