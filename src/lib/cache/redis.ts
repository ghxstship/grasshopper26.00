/* eslint-disable no-magic-numbers */
/**
 * Enterprise-grade caching utility with Redis support
 * Falls back to in-memory cache for development
 * 
 * Features:
 * - Tag-based invalidation
 * - Distributed locking
 * - Cache metrics
 * - TTL management
 * - Automatic cleanup
 */

import { Redis } from '@upstash/redis';

// Cache TTL constants (seconds)
export const CacheTTL = {
  REALTIME: 0,
  VERY_SHORT: 60,        // 1 minute
  SHORT: 300,            // 5 minutes
  MEDIUM: 900,           // 15 minutes
  LONG: 3600,            // 1 hour
  VERY_LONG: 86400,      // 24 hours
  PERMANENT: 31536000,   // 1 year
} as const;

interface CacheOptions {
  ttl?: number;          // Time to live in seconds
  tags?: string[];       // Cache tags for invalidation
  nx?: boolean;          // Only set if key doesn't exist (for locking)
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

class CacheManager {
  private memoryCache: Map<string, { value: any; expires: number; tags: string[] }> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';
  private redis: Redis | null = null;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  constructor() {
    // Initialize Redis client for production
    if (this.isProduction && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const result = await this.getFromRedis<T>(key);
        if (result !== null) {
          this.metrics.hits++;
        } else {
          this.metrics.misses++;
        }
        return result;
      }
      const result = this.getFromMemory<T>(key);
      if (result !== null) {
        this.metrics.hits++;
      } else {
        this.metrics.misses++;
      }
      return result;
    } catch (error) {
      this.metrics.errors++;
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    try {
      if (this.redis) {
        const success = await this.setInRedis(key, value, options);
        if (success) this.metrics.sets++;
        return success;
      }
      this.setInMemory(key, value, options);
      this.metrics.sets++;
      return true;
    } catch (error) {
      this.metrics.errors++;
      console.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (this.redis) {
        await this.deleteFromRedis(key);
        this.metrics.deletes++;
        return true;
      }
      const deleted = this.memoryCache.delete(key);
      if (deleted) this.metrics.deletes++;
      return deleted;
    } catch (error) {
      this.metrics.errors++;
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    try {
      if (this.redis) {
        return await this.invalidateRedisTag(tag);
      }
      // Invalidate all keys with this tag
      let count = 0;
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags.includes(tag)) {
          this.memoryCache.delete(key);
          count++;
        }
      }
      this.metrics.deletes += count;
      return count;
    } catch (error) {
      this.metrics.errors++;
      console.error('Cache invalidate by tag error:', error);
      return 0;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.redis) {
        await this.clearRedis();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      this.metrics.errors++;
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Acquire a distributed lock
   * @param key Lock key
   * @param ttl Lock TTL in seconds (default: 10)
   * @returns true if lock acquired, false otherwise
   */
  async acquireLock(key: string, ttl: number = 10): Promise<boolean> {
    const lockKey = `lock:${key}`;
    return await this.set(lockKey, '1', { ttl, nx: true });
  }

  /**
   * Release a distributed lock
   * @param key Lock key
   */
  async releaseLock(key: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    return await this.delete(lockKey);
  }

  /**
   * Execute function with distributed lock
   * @param key Lock key
   * @param fn Function to execute
   * @param ttl Lock TTL in seconds
   * @param maxRetries Maximum retry attempts
   */
  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 10,
    maxRetries: number = 3
  ): Promise<T> {
    let retries = 0;
    
    while (retries < maxRetries) {
      const acquired = await this.acquireLock(key, ttl);
      
      if (acquired) {
        try {
          return await fn();
        } finally {
          await this.releaseLock(key);
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * (retries + 1)));
      retries++;
    }
    
    throw new Error(`Failed to acquire lock after ${maxRetries} attempts`);
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics & { hitRate: number } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? this.metrics.hits / total : 0;
    
    return {
      ...this.metrics,
      hitRate,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  // Memory cache methods
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  private setInMemory(key: string, value: any, options?: CacheOptions): void {
    const ttl = options?.ttl || 3600; // Default 1 hour
    const expires = Date.now() + ttl * 1000;
    const tags = options?.tags || [];

    this.memoryCache.set(key, { value, expires, tags });

    // Clean up expired entries periodically
    if (this.memoryCache.size > 1000) {
      this.cleanupMemoryCache();
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expires) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Redis methods
  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const value = await this.redis.get(key);
      return value as T | null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  private async setInRedis(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    if (!this.redis) return false;
    
    try {
      const ttl = options?.ttl || CacheTTL.SHORT;
      
      // Use SET with NX option for locking
      if (options?.nx) {
        const result = await this.redis.set(key, value, { ex: ttl, nx: true });
        return result === 'OK';
      }
      
      // Regular set with TTL
      await this.redis.setex(key, ttl, value);
      
      // Add to tag sets for invalidation
      if (options?.tags && options.tags.length > 0) {
        const pipeline = this.redis.pipeline();
        for (const tag of options.tags) {
          pipeline.sadd(`tag:${tag}`, key);
          pipeline.expire(`tag:${tag}`, ttl);
        }
        await pipeline.exec();
      }
      
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  private async deleteFromRedis(key: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  private async invalidateRedisTag(tag: string): Promise<number> {
    if (!this.redis) return 0;
    
    try {
      const tagKey = `tag:${tag}`;
      const keys = await this.redis.smembers(tagKey);
      
      if (keys.length === 0) return 0;
      
      // Delete all keys and the tag set
      const pipeline = this.redis.pipeline();
      for (const key of keys) {
        pipeline.del(key);
      }
      pipeline.del(tagKey);
      await pipeline.exec();
      
      return keys.length;
    } catch (error) {
      console.error('Redis invalidate tag error:', error);
      return 0;
    }
  }

  private async clearRedis(): Promise<void> {
    if (!this.redis) return;
    
    try {
      // Note: flushdb clears entire database - use with caution
      // In production, you might want to only clear keys with a specific prefix
      await this.redis.flushdb();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Cache key generators with namespace
export const CacheKeys = {
  // Events
  event: (id: string) => `gvteway:event:${id}`,
  eventList: (filters: string) => `gvteway:events:list:${filters}`,
  eventTickets: (id: string) => `gvteway:event:${id}:tickets`,
  
  // Artists
  artist: (id: string) => `gvteway:artist:${id}`,
  artistEvents: (id: string) => `gvteway:artist:${id}:events`,
  
  // Orders
  order: (id: string) => `gvteway:order:${id}`,
  userOrders: (userId: string) => `gvteway:user:${userId}:orders`,
  
  // Search
  search: (query: string, filters: string = '') => `gvteway:search:${query}:${filters}`,
  
  // Analytics
  analytics: (type: string, period: string = 'day') => `gvteway:analytics:${type}:${period}`,
  
  // Session
  session: (userId: string) => `gvteway:session:${userId}`,
  
  // Rate limiting
  rateLimit: (identifier: string) => `gvteway:ratelimit:${identifier}`,
  
  // Products
  product: (id: string) => `gvteway:product:${id}`,
  productList: (filters: string) => `gvteway:products:list:${filters}`,
};

// Cache tags for invalidation
export const CacheTags = {
  // Top-level domains
  EVENTS: 'events',
  ARTISTS: 'artists',
  ORDERS: 'orders',
  USERS: 'users',
  PRODUCTS: 'products',
  ANALYTICS: 'analytics',
  
  // Specific entities (use functions)
  event: (id: string) => `event:${id}`,
  artist: (id: string) => `artist:${id}`,
  order: (id: string) => `order:${id}`,
  user: (id: string) => `user:${id}`,
  product: (id: string) => `product:${id}`,
} as const;

// Caching decorator
export function Cached(ttl: number = CacheTTL.SHORT, tags?: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `gvteway:${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cache.set(cacheKey, result, { ttl, tags });

      return result;
    };

    return descriptor;
  };
}

/**
 * Helper function for cache-aside pattern
 */
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Try cache first
  const cached = await cache.get<T>(key);
  if (cached !== null) return cached;
  
  // Fetch from source
  const result = await fetcher();
  
  // Store in cache
  await cache.set(key, result, options);
  
  return result;
}

/**
 * Helper function for cache-aside with lock (prevent stampede)
 */
export async function cacheAsideWithLock<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Try cache first
  const cached = await cache.get<T>(key);
  if (cached !== null) return cached;
  
  // Use distributed lock to prevent cache stampede
  return await cache.withLock(
    key,
    async () => {
      // Double-check cache after acquiring lock
      const cachedAfterLock = await cache.get<T>(key);
      if (cachedAfterLock !== null) return cachedAfterLock;
      
      // Fetch and cache
      const result = await fetcher();
      await cache.set(key, result, options);
      return result;
    },
    10,
    3
  );
}
