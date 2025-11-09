/**
 * Supabase Connection Pooling Configuration
 * 
 * This module configures connection pooling for high-traffic scenarios.
 * Supabase uses PgBouncer for connection pooling by default, but we need
 * to configure our client properly for optimal performance.
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Connection pool configuration for server-side operations
 * Uses transaction mode pooling for better performance under high load
 */
export const poolConfig = {
  auth: {
    persistSession: false, // Disable session persistence for server-side
    autoRefreshToken: false, // Disable auto-refresh for pooled connections
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-connection-pool': 'true',
    },
  },
}

/**
 * Create a pooled Supabase client for server-side operations
 * Use this for API routes, server actions, and background jobs
 * 
 * @example
 * ```ts
 * import { createPooledClient } from '@/lib/supabase/pool'
 * 
 * const supabase = createPooledClient()
 * const { data, error } = await supabase.from('events').select('*')
 * ```
 */
export function createPooledClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey, poolConfig)
}

/**
 * Connection pool statistics and monitoring
 * Use this to track connection pool health
 */
export interface PoolStats {
  activeConnections: number
  idleConnections: number
  waitingClients: number
  totalConnections: number
}

/**
 * Get current connection pool statistics
 * Note: This requires Supabase Management API access
 */
export async function getPoolStats(): Promise<PoolStats | null> {
  try {
    // This would require Supabase Management API integration
    // For now, return null - implement when Management API is available
    return null
  } catch (error) {
    console.error('Failed to fetch pool stats:', error)
    return null
  }
}

/**
 * Best practices for connection pooling:
 * 
 * 1. Use pooled clients for server-side operations only
 * 2. Use regular clients for browser/client-side operations
 * 3. Set appropriate timeouts for long-running queries
 * 4. Monitor connection pool usage in production
 * 5. Use Supabase's connection string with ?pgbouncer=true for direct pooling
 * 
 * Connection limits:
 * - Free tier: 60 connections
 * - Pro tier: 200 connections
 * - Enterprise: Custom limits
 * 
 * PgBouncer modes:
 * - Transaction mode (recommended): Connection released after transaction
 * - Session mode: Connection held for entire session
 */
