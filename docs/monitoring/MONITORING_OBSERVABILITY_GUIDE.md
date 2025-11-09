# Monitoring & Observability Guide

## Overview

GVTEWAY implements a comprehensive monitoring and observability stack to ensure system reliability, performance, and rapid incident response.

## Architecture

### Components

1. **Application Performance Monitoring (APM)** - Sentry Performance Monitoring
2. **Error Tracking** - Sentry Error Monitoring
3. **Logging** - Centralized logging with Sentry integration
4. **Alerting** - Automated alerts for critical events
5. **Database Monitoring** - Query performance tracking
6. **Uptime Monitoring** - Health checks and system metrics
7. **Metrics API** - Real-time metrics dashboard

## Quick Start

### 1. Environment Setup

Add these variables to your `.env.local`:

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token

# Monitoring
LOG_LEVEL=info
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_DATABASE_MONITORING=true
HEALTH_CHECK_INTERVAL_MS=300000
```

### 2. Import Monitoring Utilities

```typescript
import {
  logger,
  trackPerformance,
  monitorQuery,
  sendAlert,
  AlertSeverity,
  AlertCategory,
} from '@/lib/monitoring';
```

## Usage Examples

### Logging

```typescript
import { logger } from '@/lib/monitoring';

// Info logging
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
});

// Error logging
logger.error('Payment failed', error, {
  userId: user.id,
  amount: 5000,
  paymentMethod: 'card',
});

// Performance logging
logger.logPerformance('checkout-process', duration, {
  userId: user.id,
  itemCount: 3,
});

// Security event logging
logger.logSecurityEvent('failed-login-attempt', 'high', {
  email: attempt.email,
  ipAddress: request.ip,
});
```

### Performance Monitoring

```typescript
import { measureAsync, trackAPIPerformance } from '@/lib/monitoring';

// Measure async function
const result = await measureAsync(
  'fetch-user-data',
  async () => {
    return await fetchUserData(userId);
  },
  { userId }
);

// Track API performance
trackAPIPerformance({
  endpoint: '/api/events',
  method: 'GET',
  statusCode: 200,
  duration: 145,
  userId: user.id,
});
```

### Database Monitoring

```typescript
import { monitorQuery, monitorSupabaseQuery } from '@/lib/monitoring';

// Monitor a database query
const users = await monitorQuery(
  'fetch-active-users',
  async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'active');
    return data;
  },
  {
    logQuery: true,
    alertOnSlow: true,
    slowThreshold: 1000,
  }
);

// Monitor Supabase query directly
const events = await monitorSupabaseQuery(
  'fetch-upcoming-events',
  supabase
    .from('events')
    .select('*')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
);
```

### Alerting

```typescript
import {
  sendAlert,
  alertPaymentFailure,
  alertLowInventory,
  AlertSeverity,
  AlertCategory,
} from '@/lib/monitoring';

// Send custom alert
sendAlert({
  title: 'Custom Alert',
  message: 'Something important happened',
  severity: AlertSeverity.HIGH,
  category: AlertCategory.BUSINESS,
  metadata: {
    customField: 'value',
  },
});

// Use predefined alerts
alertPaymentFailure(userId, amount, error.message);

alertLowInventory(eventId, ticketTypeId, remainingCount);
```

### Health Checks

```typescript
import { performHealthCheck, checkDatabaseHealth } from '@/lib/monitoring';

// Comprehensive health check
const health = await performHealthCheck();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
console.log(health.checks); // Individual service checks

// Database-specific health check
const dbHealth = await checkDatabaseHealth();
if (!dbHealth.healthy) {
  console.error('Database unhealthy:', dbHealth.error);
}
```

## API Endpoints

### Health Check

```bash
# Simple health check
GET /api/health

# Detailed health check with metrics
GET /api/health?detailed=true
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T14:05:00.000Z",
  "environment": "production",
  "version": "abc1234",
  "uptime": 3600000,
  "checks": [
    {
      "service": "database",
      "status": "healthy",
      "latency": 45,
      "details": "Database connection successful"
    }
  ],
  "metrics": {
    "database": {
      "avgQueryDuration": 123.5,
      "queryCount": 1547,
      "errorRate": 0.2
    }
  }
}
```

### Metrics API

```bash
# All metrics
GET /api/monitoring/metrics

# Database metrics only
GET /api/monitoring/metrics?type=database

# System metrics only
GET /api/monitoring/metrics?type=system
```

## Monitoring Dashboard

### Accessing Metrics

Query performance statistics:
```typescript
import { getQueryStats, getSlowQueries } from '@/lib/monitoring';

// Get overall query stats
const stats = getQueryStats();
console.log(`Avg duration: ${stats.avgDuration}ms`);
console.log(`Error rate: ${stats.errorRate}%`);

// Get specific query stats
const userQueryStats = getQueryStats('fetch-user-profile');

// Get slow queries from last 5 minutes
const slowQueries = getSlowQueries(5, 1000);
```

### System Metrics

```typescript
import { getSystemMetrics } from '@/lib/monitoring';

const metrics = getSystemMetrics();
console.log(`Uptime: ${metrics.uptime}ms`);
console.log(`Memory: ${metrics.memory?.heapUsed} bytes`);
```

## Alert Thresholds

Default thresholds are configured in `ALERT_THRESHOLDS`:

```typescript
{
  // Performance
  API_RESPONSE_TIME_MS: 3000,
  DATABASE_QUERY_TIME_MS: 1000,
  PAGE_LOAD_TIME_MS: 5000,

  // Errors
  ERROR_RATE_PER_MINUTE: 50,
  ERROR_RATE_PER_HOUR: 500,

  // Infrastructure
  MEMORY_USAGE_PERCENT: 85,
  CPU_USAGE_PERCENT: 80,
  DISK_USAGE_PERCENT: 90,

  // Business
  LOW_INVENTORY_COUNT: 20,
  PAYMENT_FAILURE_RATE_PERCENT: 5,

  // Security
  FAILED_LOGIN_ATTEMPTS: 5,
  RATE_LIMIT_REQUESTS_PER_MINUTE: 100,
}
```

## Sentry Integration

### Features Enabled

- ✅ Error tracking (client, server, edge)
- ✅ Performance monitoring (traces, spans)
- ✅ Session replay
- ✅ Release tracking
- ✅ Custom metrics
- ✅ Breadcrumbs
- ✅ User context
- ✅ Custom tags and metadata

### Configuration

Client (`sentry.client.config.ts`):
- Trace sample rate: 10% in production
- Session replay: 10% of sessions, 100% on errors
- Browser tracing integration
- Replay integration with privacy controls

Server (`sentry.server.config.ts`):
- Trace sample rate: 10% in production
- Profile sample rate: 10% in production
- HTTP integration
- Prisma integration (if applicable)

## Best Practices

### 1. Logging

- Use appropriate log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Include relevant context (userId, requestId, etc.)
- Don't log sensitive data (passwords, tokens, PII)
- Use structured logging with context objects

### 2. Performance Monitoring

- Monitor critical user paths (checkout, registration, etc.)
- Set appropriate slow query thresholds
- Track business metrics (conversions, revenue, etc.)
- Monitor external API calls

### 3. Alerting

- Set appropriate severity levels
- Include actionable information in alerts
- Use fingerprinting to group related alerts
- Don't alert on expected errors

### 4. Database Monitoring

- Monitor slow queries (>1000ms)
- Track query error rates
- Monitor connection pool health
- Alert on connection failures

### 5. Health Checks

- Run periodic health checks (every 5 minutes)
- Monitor all critical services
- Include latency thresholds
- Expose readiness/liveness endpoints for orchestration

## Troubleshooting

### High Memory Usage

```typescript
import { getSystemMetrics } from '@/lib/monitoring';

const metrics = getSystemMetrics();
if (metrics.memory) {
  const heapUsedMB = metrics.memory.heapUsed / 1024 / 1024;
  const heapTotalMB = metrics.memory.heapTotal / 1024 / 1024;
  console.log(`Heap: ${heapUsedMB}MB / ${heapTotalMB}MB`);
}
```

### Slow Queries

```typescript
import { getSlowQueries } from '@/lib/monitoring';

// Get queries slower than 2000ms in last 10 minutes
const slowQueries = getSlowQueries(10, 2000);
slowQueries.forEach(q => {
  console.log(`${q.query}: ${q.duration}ms`);
});
```

### Failed Queries

```typescript
import { getFailedQueries } from '@/lib/monitoring';

// Get failed queries from last 5 minutes
const failed = getFailedQueries(5);
failed.forEach(q => {
  console.log(`${q.query}: ${q.error}`);
});
```

## Production Checklist

- [ ] Sentry DSN configured
- [ ] Log level set to `info` or `warn`
- [ ] Performance monitoring enabled
- [ ] Alert thresholds configured
- [ ] Health check endpoint accessible
- [ ] Uptime monitoring configured (external service)
- [ ] Database monitoring enabled
- [ ] Error notifications configured
- [ ] Metrics dashboard accessible
- [ ] Incident response plan documented

## External Monitoring

### Recommended Services

1. **Uptime Monitoring**: UptimeRobot, Pingdom, or StatusCake
   - Monitor: `https://your-domain.com/api/health`
   - Frequency: Every 5 minutes
   - Alert on: Status code != 200

2. **Synthetic Monitoring**: Datadog Synthetics or New Relic Synthetics
   - Test critical user flows
   - Monitor from multiple regions
   - Alert on failures or slow response times

3. **Log Aggregation**: Sentry (included) or Datadog Logs
   - Centralize all application logs
   - Set up log-based alerts
   - Create dashboards for key metrics

## Support

For issues or questions about monitoring:
- Email: support@gvteway.com
- Documentation: `/docs/monitoring/`
- Sentry Dashboard: https://sentry.io/organizations/your-org/

## Related Documentation

- [API Documentation](../api/README.md)
- [Database Documentation](../database/QUICK_START_GUIDE.md)
- [Deployment Guide](../deployment/README.md)
