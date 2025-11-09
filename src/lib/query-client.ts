/**
 * React Query (TanStack Query) configuration
 * Centralized query client with optimal defaults for GVTEWAY
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { cache, CacheTTL } from './cache/redis';

// Default options for all queries and mutations
const defaultOptions: DefaultOptions = {
  queries: {
    // Stale time: Data is considered fresh for 5 minutes
    staleTime: CacheTTL.SHORT * 1000,
    
    // Garbage collection time: Unused data is kept for 10 minutes
    gcTime: CacheTTL.SHORT * 2 * 1000,
    
    // Don't refetch on window focus by default
    refetchOnWindowFocus: false,
    
    // Don't refetch on reconnect by default
    refetchOnReconnect: false,
    
    // Don't refetch on mount by default
    refetchOnMount: false,
    
    // Retry failed requests once
    retry: 1,
    
    // Retry delay: exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Don't retry mutations by default
    retry: 0,
  },
};

// Create query client instance
export const queryClient = new QueryClient({
  defaultOptions,
});

/**
 * Query key factory for consistent key generation
 * Use these to ensure cache invalidation works correctly
 */
export const queryKeys = {
  // Events
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.events.lists(), filters] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
    tickets: (id: string) => [...queryKeys.events.detail(id), 'tickets'] as const,
  },
  
  // Artists
  artists: {
    all: ['artists'] as const,
    lists: () => [...queryKeys.artists.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.artists.lists(), filters] as const,
    details: () => [...queryKeys.artists.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.artists.details(), id] as const,
    events: (id: string) => [...queryKeys.artists.detail(id), 'events'] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    user: (userId: string) => [...queryKeys.orders.all, 'user', userId] as const,
  },
  
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    favorites: () => [...queryKeys.user.all, 'favorites'] as const,
  },
  
  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    event: (id: string) => [...queryKeys.analytics.all, 'event', id] as const,
    sales: (period: string) => [...queryKeys.analytics.all, 'sales', period] as const,
  },
  
  // Search
  search: {
    all: ['search'] as const,
    query: (q: string, filters: Record<string, any>) => [...queryKeys.search.all, q, filters] as const,
  },
};

/**
 * Invalidation helpers
 * Use these after mutations to update the cache
 */
export const invalidateQueries = {
  // Invalidate all events
  allEvents: () => queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
  
  // Invalidate specific event
  event: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) }),
  
  // Invalidate all artists
  allArtists: () => queryClient.invalidateQueries({ queryKey: queryKeys.artists.all }),
  
  // Invalidate specific artist
  artist: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.artists.detail(id) }),
  
  // Invalidate all orders
  allOrders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  
  // Invalidate specific order
  order: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) }),
  
  // Invalidate user orders
  userOrders: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.orders.user(userId) }),
  
  // Invalidate user data
  user: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.all }),
  
  // Invalidate analytics
  analytics: () => queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
};

/**
 * Prefetch helpers
 * Use these to warm the cache before navigation
 */
export const prefetchQueries = {
  event: async (id: string, fetcher: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.events.detail(id),
      queryFn: fetcher,
      staleTime: CacheTTL.SHORT * 1000,
    });
  },
  
  artist: async (id: string, fetcher: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.artists.detail(id),
      queryFn: fetcher,
      staleTime: CacheTTL.SHORT * 1000,
    });
  },
};

/**
 * Cache synchronization with Redis
 * Optionally sync React Query cache with Redis for server-side caching
 */
export const syncWithRedis = {
  async setQueryData(key: string, data: any, ttl: number = CacheTTL.SHORT) {
    await cache.set(key, data, { ttl });
  },
  
  async getQueryData<T>(key: string): Promise<T | null> {
    return await cache.get<T>(key);
  },
};
