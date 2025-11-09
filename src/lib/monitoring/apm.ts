/**
 * Application Performance Monitoring (APM)
 * Integrates with Sentry Performance Monitoring
 */

import * as Sentry from '@sentry/nextjs';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface DatabaseMetrics {
  query: string;
  duration: number;
  rowCount?: number;
  error?: string;
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  userId?: string;
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({
    name,
    op,
  }, (span) => span);
}

/**
 * Start a span within a transaction
 */
export function startSpan(operation: string, description: string) {
  return Sentry.startSpan({
    op: operation,
    name: description,
  }, (span) => span);
}

/**
 * Track custom performance metric
 */
export function trackPerformance(metrics: PerformanceMetrics): void {
  Sentry.startSpan({
    name: metrics.operation,
    op: 'measure',
  }, (span) => {
    if (span) {
      span.setAttribute('success', metrics.success);
      span.setAttribute('duration', metrics.duration);
      
      if (metrics.metadata) {
        Object.entries(metrics.metadata).forEach(([key, value]) => {
          span.setAttribute(key, value);
        });
      }
    }
  });

  // Also track as custom metric
  Sentry.metrics.distribution(metrics.operation, metrics.duration, {
    unit: 'millisecond',
  });
}

/**
 * Track database query performance
 */
export function trackDatabaseQuery(metrics: DatabaseMetrics): void {
  Sentry.startSpan({
    op: 'db.query',
    name: metrics.query.substring(0, 100), // Truncate long queries
  }, (span) => {
    if (span) {
      span.setAttribute('duration', metrics.duration);
      if (metrics.rowCount !== undefined) {
        span.setAttribute('rowCount', metrics.rowCount);
      }
      if (metrics.error) {
        span.setStatus({ code: 2, message: metrics.error }); // 2 = INTERNAL_ERROR
        span.setAttribute('error', metrics.error);
      }
    }
  });

  // Track slow queries
  if (metrics.duration > 1000) {
    Sentry.captureMessage(`Slow database query: ${metrics.query.substring(0, 100)}`, {
      level: 'warning',
      extra: {
        duration: metrics.duration,
        query: metrics.query,
        rowCount: metrics.rowCount,
      },
    });
  }
}

/**
 * Track API endpoint performance
 */
export function trackAPIPerformance(metrics: APIMetrics): void {
  Sentry.startSpan({
    name: `${metrics.method} ${metrics.endpoint}`,
    op: 'http.server',
  }, (span) => {
    if (span) {
      span.setAttribute('method', metrics.method);
      span.setAttribute('endpoint', metrics.endpoint);
      span.setAttribute('statusCode', metrics.statusCode);
      if (metrics.userId) {
        span.setAttribute('userId', metrics.userId);
      }
      span.setStatus({ code: metrics.statusCode >= 400 ? 2 : 1 });
    }
  });

  // Track metrics
  Sentry.metrics.distribution('api.response_time', metrics.duration, {
    unit: 'millisecond',
  });

  // Alert on slow endpoints
  if (metrics.duration > 3000) {
    Sentry.captureMessage(`Slow API endpoint: ${metrics.method} ${metrics.endpoint}`, {
      level: 'warning',
      extra: {
        duration: metrics.duration,
        statusCode: metrics.statusCode,
        userId: metrics.userId,
      },
    });
  }
}

/**
 * Track custom business metrics
 */
export function trackBusinessMetric(name: string, value: number): void {
  Sentry.metrics.gauge(name, value, {
    unit: 'none',
  });
}

/**
 * Track user action
 */
export function trackUserAction(action: string, userId?: string, metadata?: Record<string, any>): void {
  Sentry.addBreadcrumb({
    category: 'user.action',
    message: action,
    level: 'info',
    data: {
      userId,
      ...metadata,
    },
  });

  // Track as distribution metric
  Sentry.metrics.distribution('user.action', 1, {
    unit: 'none',
  });
}

/**
 * Measure function execution time
 */
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now();
  let success = true;
  let error: Error | undefined;

  try {
    const result = await fn();
    return result;
  } catch (err) {
    success = false;
    error = err as Error;
    throw err;
  } finally {
    const duration = performance.now() - startTime;
    
    trackPerformance({
      operation,
      duration,
      success,
      metadata: {
        ...metadata,
        error: error?.message,
      },
    });
  }
}

/**
 * Measure synchronous function execution time
 */
export function measure<T>(
  operation: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const startTime = performance.now();
  let success = true;
  let error: Error | undefined;

  try {
    const result = fn();
    return result;
  } catch (err) {
    success = false;
    error = err as Error;
    throw err;
  } finally {
    const duration = performance.now() - startTime;
    
    trackPerformance({
      operation,
      duration,
      success,
      metadata: {
        ...metadata,
        error: error?.message,
      },
    });
  }
}

/**
 * Create a performance monitoring wrapper for API routes
 */
export function withPerformanceMonitoring(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const startTime = performance.now();
    const url = new URL(req.url);
    const endpoint = url.pathname;
    const method = req.method;

    let statusCode = 200;
    let userId: string | undefined;

    try {
      const response = await handler(req);
      statusCode = response.status;
      
      // Try to extract user ID from response headers or auth
      userId = response.headers.get('x-user-id') || undefined;

      return response;
    } catch (error) {
      statusCode = 500;
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      
      trackAPIPerformance({
        endpoint,
        method,
        statusCode,
        duration,
        userId,
      });
    }
  };
}
