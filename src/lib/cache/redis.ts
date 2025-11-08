/**
 * Caching utility with Redis-compatible interface
 * Falls back to in-memory cache for development
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

class CacheManager {
  private memoryCache: Map<string, { value: any; expires: number; tags: string[] }> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';
  private redisUrl = process.env.REDIS_URL;

  async get<T>(key: string): Promise<T | null> {
    if (this.isProduction && this.redisUrl) {
      return this.getFromRedis(key);
    }
    return this.getFromMemory(key);
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    if (this.isProduction && this.redisUrl) {
      await this.setInRedis(key, value, options);
    } else {
      this.setInMemory(key, value, options);
    }
  }

  async delete(key: string): Promise<void> {
    if (this.isProduction && this.redisUrl) {
      await this.deleteFromRedis(key);
    } else {
      this.memoryCache.delete(key);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    if (this.isProduction && this.redisUrl) {
      await this.invalidateRedisTag(tag);
    } else {
      // Invalidate all keys with this tag
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags.includes(tag)) {
          this.memoryCache.delete(key);
        }
      }
    }
  }

  async clear(): Promise<void> {
    if (this.isProduction && this.redisUrl) {
      await this.clearRedis();
    } else {
      this.memoryCache.clear();
    }
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

  // Redis methods (placeholder for production)
  private async getFromRedis<T>(key: string): Promise<T | null> {
    // TODO: Implement Redis client
    // const redis = await getRedisClient();
    // const value = await redis.get(key);
    // return value ? JSON.parse(value) : null;
    return null;
  }

  private async setInRedis(key: string, value: any, options?: CacheOptions): Promise<void> {
    // TODO: Implement Redis client
    // const redis = await getRedisClient();
    // const ttl = options?.ttl || 3600;
    // await redis.setex(key, ttl, JSON.stringify(value));
    // if (options?.tags) {
    //   for (const tag of options.tags) {
    //     await redis.sadd(`tag:${tag}`, key);
    //   }
    // }
  }

  private async deleteFromRedis(key: string): Promise<void> {
    // TODO: Implement Redis client
    // const redis = await getRedisClient();
    // await redis.del(key);
  }

  private async invalidateRedisTag(tag: string): Promise<void> {
    // TODO: Implement Redis client
    // const redis = await getRedisClient();
    // const keys = await redis.smembers(`tag:${tag}`);
    // if (keys.length > 0) {
    //   await redis.del(...keys);
    //   await redis.del(`tag:${tag}`);
    // }
  }

  private async clearRedis(): Promise<void> {
    // TODO: Implement Redis client
    // const redis = await getRedisClient();
    // await redis.flushdb();
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Cache key generators
export const CacheKeys = {
  event: (id: string) => `event:${id}`,
  eventList: (filters: string) => `events:${filters}`,
  artist: (id: string) => `artist:${id}`,
  order: (id: string) => `order:${id}`,
  userOrders: (userId: string) => `user:${userId}:orders`,
  searchResults: (query: string) => `search:${query}`,
  analytics: (type: string) => `analytics:${type}`,
};

// Cache tags for invalidation
export const CacheTags = {
  EVENTS: 'events',
  ARTISTS: 'artists',
  ORDERS: 'orders',
  ANALYTICS: 'analytics',
};

// Caching decorator
export function Cached(ttl: number = 3600, tags?: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
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
