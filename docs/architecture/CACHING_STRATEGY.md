# GVTEWAY Caching Strategy

**Status:** ✅ Enterprise-Grade  
**Last Updated:** 2025-01-09  
**Owner:** Engineering Team

---

## Overview

This document defines the comprehensive caching strategy for GVTEWAY, covering all layers from browser to database, with clear TTL policies, invalidation patterns, and monitoring guidelines.

---

## Table of Contents

1. [Caching Layers](#caching-layers)
2. [Cache Key Conventions](#cache-key-conventions)
3. [TTL Policies](#ttl-policies)
4. [Invalidation Strategies](#invalidation-strategies)
5. [Implementation Patterns](#implementation-patterns)
6. [Monitoring & Metrics](#monitoring--metrics)
7. [Best Practices](#best-practices)

---

## Caching Layers

### Layer 1: Browser Cache
**Technology:** HTTP Cache-Control, Service Worker  
**Purpose:** Static assets, API responses  
**TTL:** Varies by resource type

```typescript
// Static assets: 1 year
Cache-Control: public, max-age=31536000, immutable

// API responses: 5 minutes
Cache-Control: public, max-age=300, stale-while-revalidate=60

// Dynamic content: No cache
Cache-Control: private, no-cache, no-store, must-revalidate
```

### Layer 2: CDN Cache (Vercel Edge)
**Technology:** Vercel Edge Network  
**Purpose:** Static pages, API routes, images  
**TTL:** Configured per route

```typescript
// next.config.js
export const config = {
  // Static pages: 1 hour
  revalidate: 3600,
  
  // API routes: Custom per endpoint
  headers: async () => [
    {
      source: '/api/events/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=60' }
      ]
    }
  ]
}
```

### Layer 3: Application Cache (React Query)
**Technology:** TanStack Query (React Query)  
**Purpose:** Server state, API responses  
**TTL:** 5 minutes default, varies by data type

```typescript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Layer 4: Redis Cache
**Technology:** Upstash Redis  
**Purpose:** Session data, rate limiting, computed results  
**TTL:** Varies by use case

```typescript
// Session data: 24 hours
await redis.setex(`session:${userId}`, 86400, sessionData);

// Rate limiting: 1 hour
await redis.setex(`ratelimit:${ip}`, 3600, requestCount);

// Computed analytics: 15 minutes
await redis.setex(`analytics:${type}`, 900, results);
```

### Layer 5: Database Query Cache (Supabase)
**Technology:** PostgreSQL query cache  
**Purpose:** Frequently accessed queries  
**TTL:** Managed by PostgreSQL

```sql
-- Materialized views for expensive queries
CREATE MATERIALIZED VIEW event_analytics AS
SELECT event_id, COUNT(*) as ticket_count, SUM(price) as revenue
FROM tickets
GROUP BY event_id;

-- Refresh strategy
REFRESH MATERIALIZED VIEW CONCURRENTLY event_analytics;
```

---

## Cache Key Conventions

### Naming Pattern
```
{domain}:{entity}:{identifier}:{variant}
```

### Examples
```typescript
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
  search: (query: string, filters: string) => `gvteway:search:${query}:${filters}`,
  
  // Analytics
  analytics: (type: string, period: string) => `gvteway:analytics:${type}:${period}`,
  
  // Session
  session: (userId: string) => `gvteway:session:${userId}`,
  
  // Rate limiting
  rateLimit: (identifier: string) => `gvteway:ratelimit:${identifier}`,
};
```

---

## TTL Policies

### By Data Type

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| **Static Assets** | 1 year | Immutable, versioned |
| **Event Details** | 5 minutes | Frequently updated |
| **Event List** | 2 minutes | High traffic, frequent changes |
| **Artist Profiles** | 15 minutes | Infrequent updates |
| **Order History** | 10 minutes | Historical data |
| **Search Results** | 5 minutes | Dynamic, personalized |
| **Analytics** | 15 minutes | Computed, expensive |
| **Session Data** | 24 hours | User session lifetime |
| **Rate Limits** | 1 hour | Security window |
| **User Preferences** | 1 hour | Infrequent changes |

### By Update Frequency

```typescript
export const CacheTTL = {
  // Real-time (no cache)
  REALTIME: 0,
  
  // Very short (high volatility)
  VERY_SHORT: 60,        // 1 minute
  SHORT: 300,            // 5 minutes
  
  // Medium (moderate volatility)
  MEDIUM: 900,           // 15 minutes
  LONG: 3600,            // 1 hour
  
  // Very long (low volatility)
  VERY_LONG: 86400,      // 24 hours
  PERMANENT: 31536000,   // 1 year
} as const;
```

---

## Invalidation Strategies

### 1. Time-Based Invalidation (TTL)
**Use Case:** Most cached data  
**Implementation:** Automatic expiration

```typescript
// Set with TTL
await cache.set(key, value, { ttl: CacheTTL.SHORT });
```

### 2. Tag-Based Invalidation
**Use Case:** Related data groups  
**Implementation:** Invalidate by tag

```typescript
// Set with tags
await cache.set(
  CacheKeys.event(eventId),
  eventData,
  { 
    ttl: CacheTTL.SHORT,
    tags: [CacheTags.EVENTS, `event:${eventId}`]
  }
);

// Invalidate all events
await cache.invalidateByTag(CacheTags.EVENTS);

// Invalidate specific event and related data
await cache.invalidateByTag(`event:${eventId}`);
```

### 3. Event-Based Invalidation
**Use Case:** Data mutations  
**Implementation:** Invalidate on write operations

```typescript
// After creating/updating event
async function updateEvent(id: string, data: EventData) {
  const result = await supabase
    .from('events')
    .update(data)
    .eq('id', id);
  
  // Invalidate caches
  await cache.delete(CacheKeys.event(id));
  await cache.invalidateByTag(CacheTags.EVENTS);
  
  // Invalidate React Query
  queryClient.invalidateQueries({ queryKey: ['event', id] });
  queryClient.invalidateQueries({ queryKey: ['events'] });
  
  return result;
}
```

### 4. Stale-While-Revalidate
**Use Case:** High-traffic, non-critical data  
**Implementation:** Serve stale, fetch fresh

```typescript
// React Query with stale-while-revalidate
const { data } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  staleTime: 5 * 60 * 1000,     // 5 minutes
  gcTime: 10 * 60 * 1000,       // 10 minutes
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
});
```

### Cache Tags Hierarchy

```typescript
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
} as const;
```

---

## Implementation Patterns

### Pattern 1: Cache-Aside (Lazy Loading)

```typescript
async function getEvent(id: string): Promise<Event> {
  // Try cache first
  const cached = await cache.get<Event>(CacheKeys.event(id));
  if (cached) return cached;
  
  // Fetch from database
  const event = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  // Store in cache
  await cache.set(
    CacheKeys.event(id),
    event,
    { 
      ttl: CacheTTL.SHORT,
      tags: [CacheTags.EVENTS, CacheTags.event(id)]
    }
  );
  
  return event;
}
```

### Pattern 2: Write-Through Cache

```typescript
async function createEvent(data: EventData): Promise<Event> {
  // Write to database
  const event = await supabase
    .from('events')
    .insert(data)
    .select()
    .single();
  
  // Write to cache immediately
  await cache.set(
    CacheKeys.event(event.id),
    event,
    { 
      ttl: CacheTTL.SHORT,
      tags: [CacheTags.EVENTS, CacheTags.event(event.id)]
    }
  );
  
  // Invalidate list caches
  await cache.invalidateByTag(CacheTags.EVENTS);
  
  return event;
}
```

### Pattern 3: Cache Warming

```typescript
// Warm cache for popular events
async function warmEventCache() {
  const popularEvents = await supabase
    .from('events')
    .select('*')
    .order('ticket_sales', { ascending: false })
    .limit(50);
  
  await Promise.all(
    popularEvents.map(event =>
      cache.set(
        CacheKeys.event(event.id),
        event,
        { 
          ttl: CacheTTL.SHORT,
          tags: [CacheTags.EVENTS, CacheTags.event(event.id)]
        }
      )
    )
  );
}
```

### Pattern 4: Distributed Locking (Prevent Cache Stampede)

```typescript
async function getExpensiveData(key: string): Promise<any> {
  // Try cache
  const cached = await cache.get(key);
  if (cached) return cached;
  
  // Acquire lock
  const lockKey = `lock:${key}`;
  const acquired = await cache.set(lockKey, '1', { ttl: 10, nx: true });
  
  if (!acquired) {
    // Another process is computing, wait and retry
    await new Promise(resolve => setTimeout(resolve, 100));
    return getExpensiveData(key);
  }
  
  try {
    // Compute expensive result
    const result = await computeExpensiveData();
    
    // Cache result
    await cache.set(key, result, { ttl: CacheTTL.MEDIUM });
    
    return result;
  } finally {
    // Release lock
    await cache.delete(lockKey);
  }
}
```

---

## Monitoring & Metrics

### Key Metrics

1. **Cache Hit Rate**
   - Target: >80% for hot data
   - Formula: `hits / (hits + misses)`

2. **Cache Miss Rate**
   - Target: <20%
   - Indicates cache effectiveness

3. **Average Response Time**
   - Cache hit: <10ms
   - Cache miss: <100ms

4. **Memory Usage**
   - Monitor Redis memory
   - Alert at 80% capacity

5. **Eviction Rate**
   - Low eviction = good sizing
   - High eviction = need more memory

### Monitoring Implementation

```typescript
// Cache metrics middleware
export class CacheMetrics {
  private hits = 0;
  private misses = 0;
  
  recordHit() {
    this.hits++;
  }
  
  recordMiss() {
    this.misses++;
  }
  
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
  
  async logMetrics() {
    console.log({
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      timestamp: new Date().toISOString(),
    });
  }
}

export const cacheMetrics = new CacheMetrics();
```

### Logging

```typescript
// Cache operation logging
async function cachedGet<T>(key: string): Promise<T | null> {
  const startTime = Date.now();
  const result = await cache.get<T>(key);
  const duration = Date.now() - startTime;
  
  if (result) {
    cacheMetrics.recordHit();
    logger.debug('Cache hit', { key, duration });
  } else {
    cacheMetrics.recordMiss();
    logger.debug('Cache miss', { key, duration });
  }
  
  return result;
}
```

---

## Best Practices

### DO ✅

1. **Use appropriate TTLs** based on data volatility
2. **Tag related data** for efficient invalidation
3. **Monitor cache metrics** regularly
4. **Warm critical caches** on deployment
5. **Use stale-while-revalidate** for non-critical data
6. **Implement cache versioning** for breaking changes
7. **Set reasonable cache sizes** to prevent memory issues
8. **Use consistent key naming** conventions
9. **Handle cache failures gracefully** (fallback to DB)
10. **Document cache strategies** for each feature

### DON'T ❌

1. **Don't cache sensitive data** without encryption
2. **Don't use infinite TTLs** for dynamic data
3. **Don't forget to invalidate** on mutations
4. **Don't cache errors** or null values indefinitely
5. **Don't over-cache** low-traffic data
6. **Don't ignore cache stampede** scenarios
7. **Don't cache user-specific data** in shared cache
8. **Don't skip monitoring** cache performance
9. **Don't use cache as primary storage**
10. **Don't cache without testing** invalidation

### Cache Decision Tree

```
Is the data frequently accessed?
├─ No → Don't cache
└─ Yes
   ├─ Is it user-specific?
   │  ├─ Yes → Use client-side cache (React Query)
   │  └─ No → Continue
   ├─ Does it change frequently?
   │  ├─ Yes → Short TTL (1-5 min) + tag-based invalidation
   │  └─ No → Long TTL (15-60 min)
   └─ Is it expensive to compute?
      ├─ Yes → Cache with distributed locking
      └─ No → Simple cache-aside pattern
```

---

## Implementation Checklist

- [x] Browser caching configured
- [x] CDN caching configured (Vercel)
- [x] React Query setup with proper defaults
- [x] Redis client implemented
- [x] Cache key conventions defined
- [x] TTL policies documented
- [x] Tag-based invalidation implemented
- [x] Cache metrics tracking
- [x] Monitoring dashboard
- [x] Cache warming for critical data
- [x] Distributed locking for expensive operations
- [x] Documentation complete

---

## Related Documentation

- [State Management Guide](./STATE_MANAGEMENT.md)
- [Performance Optimization](../performance/OPTIMIZATION.md)
- [Redis Configuration](../deployment/REDIS_SETUP.md)
- [Monitoring Setup](../monitoring/SETUP.md)

---

**Last Review:** 2025-01-09  
**Next Review:** 2025-04-09  
**Maintained By:** Engineering Team
