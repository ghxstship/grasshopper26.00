/**
 * Uptime Monitoring Configuration
 * Provides health check endpoints and uptime tracking
 */

import { logger } from './logger';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      duration?: number;
      metadata?: Record<string, any>;
    };
  };
  uptime: number;
  version: string;
}

const startTime = Date.now();

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = {};

  // Database health check
  try {
    const dbStart = performance.now();
    const { checkDatabaseHealth } = await import('./database-monitor');
    const dbHealth = await checkDatabaseHealth();
    const dbDuration = performance.now() - dbStart;

    checks.database = {
      status: dbHealth.healthy ? 'pass' : 'fail',
      message: dbHealth.error || 'Database connection successful',
      duration: dbDuration,
      metadata: {
        latency: dbHealth.latency,
      },
    };
  } catch (error) {
    checks.database = {
      status: 'fail',
      message: (error as Error).message,
    };
  }

  // API health check
  try {
    const apiStart = performance.now();
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`, {
      method: 'GET',
      cache: 'no-store',
    });
    const apiDuration = performance.now() - apiStart;

    checks.api = {
      status: response.ok ? 'pass' : 'fail',
      message: response.ok ? 'API responding' : `API returned ${response.status}`,
      duration: apiDuration,
    };
  } catch (error) {
    checks.api = {
      status: 'fail',
      message: (error as Error).message,
    };
  }

  // Memory check
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage();
    const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
    const heapUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;

    checks.memory = {
      status: heapUsagePercent > 90 ? 'fail' : heapUsagePercent > 75 ? 'warn' : 'pass',
      message: `Heap usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${heapUsagePercent.toFixed(1)}%)`,
      metadata: {
        heapUsed: heapUsedMB,
        heapTotal: heapTotalMB,
        heapUsagePercent: heapUsagePercent.toFixed(1),
        rss: Math.round(memory.rss / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024),
      },
    };
  }

  // Environment check
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  checks.environment = {
    status: missingEnvVars.length === 0 ? 'pass' : 'fail',
    message:
      missingEnvVars.length === 0
        ? 'All required environment variables present'
        : `Missing environment variables: ${missingEnvVars.join(', ')}`,
    metadata: {
      missing: missingEnvVars,
    },
  };

  // Determine overall status
  const hasFailures = Object.values(checks).some((check) => check.status === 'fail');
  const hasWarnings = Object.values(checks).some((check) => check.status === 'warn');

  const status: HealthCheckResult['status'] = hasFailures
    ? 'unhealthy'
    : hasWarnings
    ? 'degraded'
    : 'healthy';

  const uptime = Date.now() - startTime;

  return {
    status,
    timestamp: new Date(),
    checks,
    uptime,
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  };
}

/**
 * Simple ping check
 */
export function ping(): { status: 'ok'; timestamp: Date; uptime: number } {
  return {
    status: 'ok',
    timestamp: new Date(),
    uptime: Date.now() - startTime,
  };
}

/**
 * Get system metrics
 */
export function getSystemMetrics(): {
  uptime: number;
  memory?: NodeJS.MemoryUsage;
  platform?: string;
  nodeVersion?: string;
} {
  const metrics: ReturnType<typeof getSystemMetrics> = {
    uptime: Date.now() - startTime,
  };

  if (typeof process !== 'undefined') {
    metrics.memory = process.memoryUsage();
    metrics.platform = process.platform;
    metrics.nodeVersion = process.version;
  }

  return metrics;
}

/**
 * Log health check results
 */
export async function logHealthCheck(): Promise<void> {
  const health = await performHealthCheck();

  if (health.status === 'unhealthy') {
    logger.error('Health check failed', undefined, {
      status: health.status,
      checks: health.checks,
    });
  } else if (health.status === 'degraded') {
    logger.warn('Health check degraded', {
      status: health.status,
      checks: health.checks,
    });
  } else {
    logger.debug('Health check passed', {
      status: health.status,
      uptime: health.uptime,
    });
  }
}

/**
 * Start periodic health monitoring
 */
export function startHealthMonitoring(intervalMs: number = 300000): NodeJS.Timeout {
  // Run initial check
  logHealthCheck();

  // Schedule periodic checks
  return setInterval(() => {
    logHealthCheck();
  }, intervalMs);
}

/**
 * Readiness check (for Kubernetes/container orchestration)
 */
export async function checkReadiness(): Promise<boolean> {
  try {
    const health = await performHealthCheck();
    return health.status !== 'unhealthy';
  } catch {
    return false;
  }
}

/**
 * Liveness check (for Kubernetes/container orchestration)
 */
export function checkLiveness(): boolean {
  // Simple check - if we can execute this, we're alive
  return true;
}
