/**
 * Database Query Performance Monitoring
 * Tracks and alerts on slow queries and database health
 */

import { trackDatabaseQuery } from './apm';
import { alertDatabaseConnectionIssue } from './alerts';
import { logger } from './logger';

export interface QueryMetrics {
  query: string;
  duration: number;
  rowCount?: number;
  error?: string;
  timestamp: Date;
}

// Store recent query metrics for analysis
const queryMetricsBuffer: QueryMetrics[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * Monitor a database query execution
 */
export async function monitorQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  options?: {
    logQuery?: boolean;
    alertOnSlow?: boolean;
    slowThreshold?: number;
  }
): Promise<T> {
  const startTime = performance.now();
  const { logQuery = true, alertOnSlow = true, slowThreshold = 1000 } = options || {};

  let result: T;
  let error: Error | undefined;
  let rowCount: number | undefined;

  try {
    result = await queryFn();
    
    // Try to extract row count if result is an array
    if (Array.isArray(result)) {
      rowCount = result.length;
    } else if (result && typeof result === 'object' && 'length' in result) {
      rowCount = (result as any).length;
    }

    return result;
  } catch (err) {
    error = err as Error;
    throw err;
  } finally {
    const duration = performance.now() - startTime;

    // Create metrics object
    const metrics: QueryMetrics = {
      query: queryName,
      duration,
      rowCount,
      error: error?.message,
      timestamp: new Date(),
    };

    // Add to buffer
    addToBuffer(metrics);

    // Log query if enabled
    if (logQuery) {
      logger.logQuery(queryName, duration, {
        rowCount,
        error: error?.message,
      });
    }

    // Track in APM
    trackDatabaseQuery({
      query: queryName,
      duration,
      rowCount,
      error: error?.message,
    });

    // Alert on slow queries
    if (alertOnSlow && duration > slowThreshold && !error) {
      logger.warn(`Slow database query detected: ${queryName}`, {
        duration,
        threshold: slowThreshold,
        rowCount,
      });
    }

    // Alert on errors
    if (error) {
      if (isConnectionError(error)) {
        alertDatabaseConnectionIssue(error.message);
      }
    }
  }
}

/**
 * Get query performance statistics
 */
export function getQueryStats(queryName?: string): {
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  count: number;
  errorRate: number;
} {
  const relevantMetrics = queryName
    ? queryMetricsBuffer.filter((m) => m.query === queryName)
    : queryMetricsBuffer;

  if (relevantMetrics.length === 0) {
    return {
      avgDuration: 0,
      maxDuration: 0,
      minDuration: 0,
      count: 0,
      errorRate: 0,
    };
  }

  const durations = relevantMetrics.map((m) => m.duration);
  const errors = relevantMetrics.filter((m) => m.error).length;

  return {
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
    count: relevantMetrics.length,
    errorRate: (errors / relevantMetrics.length) * 100,
  };
}

/**
 * Get slow queries in the last N minutes
 */
export function getSlowQueries(
  minutes: number = 5,
  threshold: number = 1000
): QueryMetrics[] {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  
  return queryMetricsBuffer
    .filter((m) => m.timestamp >= cutoff && m.duration > threshold)
    .sort((a, b) => b.duration - a.duration);
}

/**
 * Get queries with errors in the last N minutes
 */
export function getFailedQueries(minutes: number = 5): QueryMetrics[] {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  
  return queryMetricsBuffer
    .filter((m) => m.timestamp >= cutoff && m.error)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Clear query metrics buffer
 */
export function clearQueryMetrics(): void {
  queryMetricsBuffer.length = 0;
}

/**
 * Helper: Add metrics to buffer with size limit
 */
function addToBuffer(metrics: QueryMetrics): void {
  queryMetricsBuffer.push(metrics);
  
  // Keep buffer size under limit
  if (queryMetricsBuffer.length > MAX_BUFFER_SIZE) {
    queryMetricsBuffer.shift();
  }
}

/**
 * Helper: Check if error is a connection error
 */
function isConnectionError(error: Error): boolean {
  const connectionErrorPatterns = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'connection refused',
    'connection timeout',
    'network error',
    'unable to connect',
  ];

  const errorMessage = error.message.toLowerCase();
  return connectionErrorPatterns.some((pattern) =>
    errorMessage.includes(pattern.toLowerCase())
  );
}

/**
 * Supabase query monitoring wrapper
 */
export function monitorSupabaseQuery<T>(
  queryName: string,
  queryBuilder: any
): Promise<T> {
  return monitorQuery(queryName, async () => {
    const { data, error } = await queryBuilder;
    
    if (error) {
      throw error;
    }
    
    return data as T;
  });
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = performance.now();

  try {
    // Simple health check query - adjust based on your database
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();

    const latency = performance.now() - startTime;

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return {
        healthy: false,
        latency,
        error: error.message,
      };
    }

    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    const latency = performance.now() - startTime;
    return {
      healthy: false,
      latency,
      error: (error as Error).message,
    };
  }
}

/**
 * Periodic database health monitoring
 */
export function startDatabaseHealthMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(async () => {
    const health = await checkDatabaseHealth();
    
    if (!health.healthy) {
      logger.error('Database health check failed', undefined, {
        latency: health.latency,
        error: health.error,
      });
      
      if (health.error) {
        alertDatabaseConnectionIssue(health.error);
      }
    } else if (health.latency > 1000) {
      logger.warn('Database health check slow', {
        latency: health.latency,
      });
    } else {
      logger.debug('Database health check passed', {
        latency: health.latency,
      });
    }
  }, intervalMs);
}
