/**
 * Monitoring & Observability
 * Centralized exports for all monitoring utilities
 */

// APM (Application Performance Monitoring)
export {
  startTransaction,
  startSpan,
  trackPerformance,
  trackDatabaseQuery,
  trackAPIPerformance,
  trackBusinessMetric,
  trackUserAction,
  measureAsync,
  measure,
  withPerformanceMonitoring,
  type PerformanceMetrics,
  type DatabaseMetrics,
  type APIMetrics,
} from './apm';

// Alerting
export {
  sendAlert,
  alertHighErrorRate,
  alertSlowResponseTime,
  alertDatabaseConnectionIssue,
  alertHighMemoryUsage,
  alertSecurityEvent,
  alertPaymentFailure,
  alertJobFailure,
  alertRateLimitExceeded,
  alertLowInventory,
  alertWebhookFailure,
  AlertSeverity,
  AlertCategory,
  ALERT_THRESHOLDS,
  type Alert,
} from './alerts';

// Logging
export {
  logger,
  createRequestLogger,
  LogLevel,
} from './logger';

// Database Monitoring
export {
  monitorQuery,
  monitorSupabaseQuery,
  getQueryStats,
  getSlowQueries,
  getFailedQueries,
  clearQueryMetrics,
  checkDatabaseHealth,
  startDatabaseHealthMonitoring,
  type QueryMetrics,
} from './database-monitor';

// Uptime & Health Checks
export {
  performHealthCheck,
  ping,
  getSystemMetrics,
  logHealthCheck,
  startHealthMonitoring,
  checkReadiness,
  checkLiveness,
  type HealthCheckResult,
} from './uptime';
