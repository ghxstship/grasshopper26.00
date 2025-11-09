/**
 * Performance Optimization - Caching Layer
 * In-memory and Redis-compatible caching for permissions and frequently accessed data
 */

// In-memory cache for development/small deployments
class InMemoryCache {
  private cache: Map<string, { value: any; expires: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000),
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Singleton instance
const cache = new InMemoryCache();

/**
 * Cache permission checks to reduce database queries
 */
export async function getCachedPermission(
  userId: string,
  resource: string,
  action: string,
  fetcher: () => Promise<boolean>
): Promise<boolean> {
  const cacheKey = `perm:${userId}:${resource}:${action}`;
  
  // Try cache first
  const cached = await cache.get<boolean>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch from database
  const result = await fetcher();
  
  // Cache for 5 minutes
  await cache.set(cacheKey, result, 300);
  
  return result;
}

/**
 * Cache user role to reduce database queries
 */
export async function getCachedUserRole<T>(
  userId: string,
  roleType: 'team' | 'member',
  fetcher: () => Promise<T>
): Promise<T> {
  const cacheKey = `role:${roleType}:${userId}`;
  
  const cached = await cache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  const result = await fetcher();
  
  // Cache for 10 minutes
  await cache.set(cacheKey, result, 600);
  
  return result;
}

/**
 * Cache event data to reduce database queries
 */
export async function getCachedEvent<T>(
  eventId: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cacheKey = `event:${eventId}`;
  
  const cached = await cache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  const result = await fetcher();
  
  // Cache for 15 minutes
  await cache.set(cacheKey, result, 900);
  
  return result;
}

/**
 * Invalidate permission cache for a user
 */
export async function invalidateUserPermissions(userId: string): Promise<void> {
  // In a production Redis implementation, you'd use pattern matching
  // For in-memory cache, we'll clear all (simple approach)
  await cache.clear();
}

/**
 * Invalidate event cache
 */
export async function invalidateEvent(eventId: string): Promise<void> {
  await cache.delete(`event:${eventId}`);
}

/**
 * Get cache statistics (for monitoring)
 */
export function getCacheStats() {
  return {
    type: 'in-memory',
    size: (cache as any).cache.size,
    note: 'For production, implement Redis caching',
  };
}

export default cache;
