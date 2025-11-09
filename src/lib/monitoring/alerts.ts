/**
 * Alerting System
 * Configures automated alerts for critical events and thresholds
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertCategory {
  PERFORMANCE = 'performance',
  ERROR = 'error',
  SECURITY = 'security',
  BUSINESS = 'business',
  INFRASTRUCTURE = 'infrastructure',
}

export interface Alert {
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  metadata?: Record<string, any>;
  fingerprint?: string[];
}

/**
 * Send an alert through configured channels
 */
export function sendAlert(alert: Alert): void {
  // Log the alert
  logger.error(`[ALERT] ${alert.title}`, undefined, {
    severity: alert.severity,
    category: alert.category,
    message: alert.message,
    ...alert.metadata,
  });

  // Send to Sentry
  const sentryLevel = mapSeverityToSentryLevel(alert.severity);
  Sentry.captureMessage(alert.title, {
    level: sentryLevel,
    tags: {
      alert_severity: alert.severity,
      alert_category: alert.category,
    },
    extra: {
      message: alert.message,
      ...alert.metadata,
    },
    fingerprint: alert.fingerprint || [alert.category, alert.title],
  });

  // For critical alerts, also capture as exception for better visibility
  if (alert.severity === AlertSeverity.CRITICAL) {
    Sentry.captureException(new Error(`[CRITICAL ALERT] ${alert.title}: ${alert.message}`), {
      tags: {
        alert_severity: alert.severity,
        alert_category: alert.category,
      },
      extra: alert.metadata,
    });
  }
}

/**
 * Alert for high error rate
 */
export function alertHighErrorRate(errorCount: number, timeWindow: number): void {
  sendAlert({
    title: 'High Error Rate Detected',
    message: `${errorCount} errors in the last ${timeWindow} minutes`,
    severity: AlertSeverity.HIGH,
    category: AlertCategory.ERROR,
    metadata: {
      errorCount,
      timeWindow,
      threshold: 50,
    },
    fingerprint: ['error-rate', 'high'],
  });
}

/**
 * Alert for slow response times
 */
export function alertSlowResponseTime(endpoint: string, avgDuration: number): void {
  sendAlert({
    title: 'Slow API Response Time',
    message: `${endpoint} averaging ${avgDuration}ms response time`,
    severity: avgDuration > 5000 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
    category: AlertCategory.PERFORMANCE,
    metadata: {
      endpoint,
      avgDuration,
      threshold: 3000,
    },
    fingerprint: ['performance', 'slow-response', endpoint],
  });
}

/**
 * Alert for database connection issues
 */
export function alertDatabaseConnectionIssue(error: string): void {
  sendAlert({
    title: 'Database Connection Issue',
    message: `Unable to connect to database: ${error}`,
    severity: AlertSeverity.CRITICAL,
    category: AlertCategory.INFRASTRUCTURE,
    metadata: {
      error,
      service: 'supabase',
    },
    fingerprint: ['infrastructure', 'database', 'connection'],
  });
}

/**
 * Alert for high memory usage
 */
export function alertHighMemoryUsage(usage: number, limit: number): void {
  const percentage = (usage / limit) * 100;
  sendAlert({
    title: 'High Memory Usage',
    message: `Memory usage at ${percentage.toFixed(1)}% (${usage}MB / ${limit}MB)`,
    severity: percentage > 90 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
    category: AlertCategory.INFRASTRUCTURE,
    metadata: {
      usage,
      limit,
      percentage,
    },
    fingerprint: ['infrastructure', 'memory', 'high'],
  });
}

/**
 * Alert for security events
 */
export function alertSecurityEvent(
  event: string,
  severity: AlertSeverity,
  metadata?: Record<string, any>
): void {
  sendAlert({
    title: `Security Event: ${event}`,
    message: `Security event detected: ${event}`,
    severity,
    category: AlertCategory.SECURITY,
    metadata,
    fingerprint: ['security', event],
  });
}

/**
 * Alert for payment failures
 */
export function alertPaymentFailure(
  userId: string,
  amount: number,
  error: string
): void {
  sendAlert({
    title: 'Payment Processing Failed',
    message: `Payment of $${(amount / 100).toFixed(2)} failed for user ${userId}`,
    severity: AlertSeverity.HIGH,
    category: AlertCategory.BUSINESS,
    metadata: {
      userId,
      amount,
      error,
    },
    fingerprint: ['business', 'payment', 'failure'],
  });
}

/**
 * Alert for failed background jobs
 */
export function alertJobFailure(
  jobName: string,
  error: string,
  retryCount: number
): void {
  sendAlert({
    title: 'Background Job Failed',
    message: `Job "${jobName}" failed after ${retryCount} retries`,
    severity: retryCount >= 3 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
    category: AlertCategory.INFRASTRUCTURE,
    metadata: {
      jobName,
      error,
      retryCount,
    },
    fingerprint: ['infrastructure', 'job', jobName],
  });
}

/**
 * Alert for API rate limit exceeded
 */
export function alertRateLimitExceeded(
  endpoint: string,
  userId: string,
  requestCount: number
): void {
  sendAlert({
    title: 'API Rate Limit Exceeded',
    message: `User ${userId} exceeded rate limit on ${endpoint} (${requestCount} requests)`,
    severity: AlertSeverity.MEDIUM,
    category: AlertCategory.SECURITY,
    metadata: {
      endpoint,
      userId,
      requestCount,
    },
    fingerprint: ['security', 'rate-limit', userId],
  });
}

/**
 * Alert for low inventory
 */
export function alertLowInventory(
  eventId: string,
  ticketTypeId: string,
  remaining: number
): void {
  sendAlert({
    title: 'Low Ticket Inventory',
    message: `Only ${remaining} tickets remaining for event ${eventId}`,
    severity: remaining < 10 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
    category: AlertCategory.BUSINESS,
    metadata: {
      eventId,
      ticketTypeId,
      remaining,
    },
    fingerprint: ['business', 'inventory', eventId, ticketTypeId],
  });
}

/**
 * Alert for webhook delivery failures
 */
export function alertWebhookFailure(
  webhookUrl: string,
  error: string,
  retryCount: number
): void {
  sendAlert({
    title: 'Webhook Delivery Failed',
    message: `Failed to deliver webhook to ${webhookUrl} after ${retryCount} retries`,
    severity: retryCount >= 3 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
    category: AlertCategory.INFRASTRUCTURE,
    metadata: {
      webhookUrl,
      error,
      retryCount,
    },
    fingerprint: ['infrastructure', 'webhook', webhookUrl],
  });
}

/**
 * Helper: Map alert severity to Sentry level
 */
function mapSeverityToSentryLevel(severity: AlertSeverity): Sentry.SeverityLevel {
  switch (severity) {
    case AlertSeverity.LOW:
      return 'info';
    case AlertSeverity.MEDIUM:
      return 'warning';
    case AlertSeverity.HIGH:
      return 'error';
    case AlertSeverity.CRITICAL:
      return 'fatal';
    default:
      return 'warning';
  }
}

/**
 * Configure alert rules and thresholds
 */
export const ALERT_THRESHOLDS = {
  // Performance thresholds
  API_RESPONSE_TIME_MS: 3000,
  DATABASE_QUERY_TIME_MS: 1000,
  PAGE_LOAD_TIME_MS: 5000,

  // Error thresholds
  ERROR_RATE_PER_MINUTE: 50,
  ERROR_RATE_PER_HOUR: 500,

  // Infrastructure thresholds
  MEMORY_USAGE_PERCENT: 85,
  CPU_USAGE_PERCENT: 80,
  DISK_USAGE_PERCENT: 90,

  // Business thresholds
  LOW_INVENTORY_COUNT: 20,
  PAYMENT_FAILURE_RATE_PERCENT: 5,
  
  // Security thresholds
  FAILED_LOGIN_ATTEMPTS: 5,
  RATE_LIMIT_REQUESTS_PER_MINUTE: 100,
} as const;
