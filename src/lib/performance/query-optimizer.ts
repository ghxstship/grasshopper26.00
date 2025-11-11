/**
 * Database Query Optimization Utilities
 * Helpers for optimizing Supabase queries and reducing round-trips
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Batch fetch multiple events in a single query
 */
export async function batchFetchEvents(eventIds: string[]) {
  if (eventIds.length === 0) return [];
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds);
  
  if (error) throw error;
  
  // Return as map for O(1) lookup
  return new Map(data?.map((event: any) => [event.id, event]) || []);
}

/**
 * Batch fetch user permissions
 */
export async function batchFetchUserPermissions(userIds: string[]) {
  if (userIds.length === 0) return new Map();
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, member_role, team_role, is_team_member')
    .in('id', userIds);
  
  if (error) throw error;
  
  return new Map(data?.map((user: any) => [user.id, user]) || []);
}

/**
 * Prefetch related data to avoid N+1 queries
 */
export async function prefetchEventData(eventId: string) {
  const supabase = createClient();
  
  // Single query with all related data
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venue:venues(*),
      brand:brands(*),
      tickets(count),
      orders(count)
    `)
    .eq('id', eventId)
    .single();
  
  if (error) throw error;
  
  return data;
}

/**
 * Optimized pagination with cursor-based approach
 */
export async function cursorPaginate<T>(
  table: string,
  options: {
    cursor?: string;
    limit?: number;
    orderBy?: string;
    filters?: Record<string, any>;
  }
) {
  const supabase = createClient();
  const limit = options.limit || 20;
  
  let query = supabase
    .from(table)
    .select('*')
    .order(options.orderBy || 'created_at', { ascending: false })
    .limit(limit + 1); // Fetch one extra to determine if there are more
  
  // Apply filters
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  // Apply cursor
  if (options.cursor) {
    query = query.lt(options.orderBy || 'created_at', options.cursor);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  const hasMore = (data?.length || 0) > limit;
  const items = hasMore ? data?.slice(0, limit) : data;
  const nextCursor = hasMore && items && items.length > 0
    ? items[items.length - 1][options.orderBy || 'created_at']
    : null;
  
  return {
    items: items as T[],
    nextCursor,
    hasMore,
  };
}

/**
 * Aggregate queries to reduce database load
 */
export async function getEventStats(eventId: string) {
  const supabase = createClient();
  
  // Single aggregated query instead of multiple
  const { data, error } = await supabase.rpc('get_event_stats', {
    p_event_id: eventId
  });
  
  if (error) {
    // Fallback to multiple queries if RPC doesn't exist
    const [ticketsCount, ordersCount, revenue] = await Promise.all([
      supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
      supabase.from('orders').select('total_amount').eq('event_id', eventId).eq('status', 'completed'),
    ]);
    
    return {
      tickets_count: ticketsCount.count || 0,
      orders_count: ordersCount.count || 0,
      total_revenue: revenue.data?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0,
    };
  }
  
  return data;
}

/**
 * Debounced search to reduce query load
 */
export function createDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (query: string): Promise<T[]> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        const results = await searchFn(query);
        resolve(results);
      }, delay);
    });
  };
}

/**
 * Query result memoization
 */
const queryMemo = new Map<string, { result: any; timestamp: number }>();

export async function memoizedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlMs: number = 60000 // 1 minute default
): Promise<T> {
  const cached = queryMemo.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.result as T;
  }
  
  const result = await queryFn();
  
  queryMemo.set(key, {
    result,
    timestamp: Date.now(),
  });
  
  return result;
}

/**
 * Clear memoization cache
 */
export function clearQueryMemo(pattern?: string) {
  if (pattern) {
    for (const key of queryMemo.keys()) {
      if (key.includes(pattern)) {
        queryMemo.delete(key);
      }
    }
  } else {
    queryMemo.clear();
  }
}
