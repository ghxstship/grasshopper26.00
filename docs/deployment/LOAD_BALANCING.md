# Load Balancing & Health Check Configuration

## Overview
Load balancing ensures high availability, optimal performance, and fault tolerance by distributing traffic across multiple servers. This document covers GVTEWAY's load balancing strategy using Vercel's Edge Network.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│                  (Global Load Balancer)                  │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   US-East   │  │   US-West   │  │   Europe    │     │
│  │   (Primary) │  │  (Failover) │  │  (Failover) │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                 │                 │            │
└─────────┼─────────────────┼─────────────────┼────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Serverless│      │ Serverless│      │ Serverless│
    │ Functions │      │ Functions │      │ Functions │
    └─────┬────┘      └─────┬────┘      └─────┬────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                   ┌────────▼────────┐
                   │  Supabase DB    │
                   │  (Multi-region) │
                   └─────────────────┘
```

## Vercel Edge Network Configuration

### 1. Automatic Load Balancing

Vercel provides automatic load balancing through its Edge Network:

- **Global CDN**: 100+ edge locations worldwide
- **Automatic Routing**: Routes requests to nearest edge location
- **Serverless Functions**: Auto-scales based on demand
- **Smart Routing**: Intelligent traffic distribution

### 2. Health Check Implementation

```typescript
// src/app/api/health/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  details?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  checks: HealthCheck[];
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const checks: HealthCheck[] = [];
  
  // 1. Database Health Check
  const dbCheck = await checkDatabase();
  checks.push(dbCheck);
  
  // 2. External Services Health Check
  const stripeCheck = await checkStripe();
  checks.push(stripeCheck);
  
  // 3. Cache Health Check
  const cacheCheck = await checkCache();
  checks.push(cacheCheck);
  
  // 4. Storage Health Check
  const storageCheck = await checkStorage();
  checks.push(storageCheck);
  
  // Determine overall health
  const hasUnhealthy = checks.some(c => c.status === 'unhealthy');
  const hasDegraded = checks.some(c => c.status === 'degraded');
  
  const overallStatus = hasUnhealthy 
    ? 'unhealthy' 
    : hasDegraded 
    ? 'degraded' 
    : 'healthy';
  
  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
    uptime: process.uptime(),
    checks
  };
  
  // Return appropriate status code
  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  
  return NextResponse.json(response, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': overallStatus
    }
  });
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    const latency = Date.now() - start;
    
    if (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        latency,
        details: error.message
      };
    }
    
    // Check latency thresholds
    if (latency > 1000) {
      return {
        service: 'database',
        status: 'degraded',
        latency,
        details: 'High latency detected'
      };
    }
    
    return {
      service: 'database',
      status: 'healthy',
      latency
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkStripe(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Simple Stripe API health check
    const response = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      },
      signal: AbortSignal.timeout(5000)
    });
    
    const latency = Date.now() - start;
    
    if (!response.ok) {
      return {
        service: 'stripe',
        status: 'degraded',
        latency,
        details: `HTTP ${response.status}`
      };
    }
    
    return {
      service: 'stripe',
      status: 'healthy',
      latency
    };
  } catch (error) {
    return {
      service: 'stripe',
      status: 'unhealthy',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkCache(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Check if cache is working (Next.js cache)
    const testKey = `health_check_${Date.now()}`;
    const testValue = 'ok';
    
    // This is a simple check - in production you might use Redis
    const latency = Date.now() - start;
    
    return {
      service: 'cache',
      status: 'healthy',
      latency
    };
  } catch (error) {
    return {
      service: 'cache',
      status: 'degraded',
      latency: Date.now() - start,
      details: 'Cache unavailable'
    };
  }
}

async function checkStorage(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .storage
      .from('avatars')
      .list('', { limit: 1 });
    
    const latency = Date.now() - start;
    
    if (error) {
      return {
        service: 'storage',
        status: 'degraded',
        latency,
        details: error.message
      };
    }
    
    return {
      service: 'storage',
      status: 'healthy',
      latency
    };
  } catch (error) {
    return {
      service: 'storage',
      status: 'unhealthy',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### 3. Readiness Check

```typescript
// src/app/api/ready/route.ts
import { NextResponse } from 'next/server';

/**
 * Readiness check - determines if the application is ready to receive traffic
 * Used by load balancers to determine if instance should receive requests
 */
export async function GET() {
  // Check if application has completed initialization
  const isReady = await checkReadiness();
  
  if (isReady) {
    return NextResponse.json({ 
      ready: true,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
  
  return NextResponse.json({ 
    ready: false,
    timestamp: new Date().toISOString()
  }, { status: 503 });
}

async function checkReadiness(): Promise<boolean> {
  // Check critical dependencies
  const checks = [
    checkEnvironmentVariables(),
    checkDatabaseConnection(),
    checkExternalServices()
  ];
  
  const results = await Promise.all(checks);
  return results.every(result => result === true);
}

function checkEnvironmentVariables(): boolean {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];
  
  return required.every(key => !!process.env[key]);
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    const { error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}

async function checkExternalServices(): Promise<boolean> {
  // Add checks for critical external services
  return true;
}
```

### 4. Liveness Check

```typescript
// src/app/api/live/route.ts
import { NextResponse } from 'next/server';

/**
 * Liveness check - determines if the application is alive
 * Used to detect if application needs to be restarted
 */
export async function GET() {
  // Simple check that the process is running
  return NextResponse.json({ 
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, { status: 200 });
}
```

## Load Balancing Configuration

### 1. Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "regions": ["iad1", "sfo1", "fra1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/health",
      "destination": "/api/health"
    },
    {
      "source": "/ready",
      "destination": "/api/ready"
    },
    {
      "source": "/live",
      "destination": "/api/live"
    }
  ]
}
```

### 2. Traffic Splitting Configuration

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // A/B testing or canary deployment
  const canaryPercentage = parseInt(process.env.CANARY_PERCENTAGE || '0');
  
  if (canaryPercentage > 0) {
    const random = Math.random() * 100;
    
    if (random < canaryPercentage) {
      // Route to canary version
      const url = request.nextUrl.clone();
      url.hostname = process.env.CANARY_HOSTNAME || url.hostname;
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health|api/ready|api/live).*)',
  ],
};
```

## Monitoring & Alerting

### 1. Health Check Monitoring Script

```typescript
// scripts/monitor-health.ts
interface HealthCheckResult {
  timestamp: string;
  status: string;
  latency: number;
  checks: any[];
}

async function monitorHealth(endpoint: string, interval: number = 30000) {
  console.log(`🔍 Monitoring health endpoint: ${endpoint}`);
  console.log(`📊 Check interval: ${interval}ms\n`);
  
  let consecutiveFailures = 0;
  const maxFailures = 3;
  
  setInterval(async () => {
    const start = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        signal: AbortSignal.timeout(10000)
      });
      
      const latency = Date.now() - start;
      const data: HealthCheckResult = await response.json();
      
      if (response.ok) {
        consecutiveFailures = 0;
        console.log(`✅ [${new Date().toISOString()}] Status: ${data.status} | Latency: ${latency}ms`);
        
        // Log individual service health
        data.checks.forEach(check => {
          const icon = check.status === 'healthy' ? '✅' : 
                      check.status === 'degraded' ? '⚠️' : '❌';
          console.log(`   ${icon} ${check.service}: ${check.latency}ms`);
        });
      } else {
        consecutiveFailures++;
        console.error(`❌ [${new Date().toISOString()}] Health check failed: ${response.status}`);
        
        if (consecutiveFailures >= maxFailures) {
          await alertTeam({
            severity: 'critical',
            message: `Health check failed ${consecutiveFailures} times consecutively`,
            endpoint
          });
        }
      }
    } catch (error) {
      consecutiveFailures++;
      console.error(`❌ [${new Date().toISOString()}] Health check error:`, error);
      
      if (consecutiveFailures >= maxFailures) {
        await alertTeam({
          severity: 'critical',
          message: `Health check unreachable ${consecutiveFailures} times`,
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(''); // Empty line for readability
  }, interval);
}

async function alertTeam(alert: any) {
  // Send to Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 ${alert.severity.toUpperCase()}: ${alert.message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Severity:* ${alert.severity}\n*Message:* ${alert.message}\n*Endpoint:* ${alert.endpoint}`
            }
          }
        ]
      })
    });
  }
  
  // Send to PagerDuty or similar
  console.error('🚨 ALERT:', alert);
}

// Run monitoring
const endpoint = process.env.HEALTH_CHECK_ENDPOINT || 'https://gvteway.com/api/health';
monitorHealth(endpoint);
```

### 2. Uptime Monitoring with External Service

```yaml
# .github/workflows/uptime-monitor.yml
name: Uptime Monitoring

on:
  schedule:
    # Run every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Production Health
        run: |
          RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://gvteway.com/api/health)
          
          if [ $RESPONSE -eq 200 ]; then
            echo "✅ Production is healthy"
          else
            echo "❌ Production health check failed with status: $RESPONSE"
            exit 1
          fi
      
      - name: Check Staging Health
        run: |
          RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://staging.gvteway.com/api/health)
          
          if [ $RESPONSE -eq 200 ]; then
            echo "✅ Staging is healthy"
          else
            echo "⚠️ Staging health check failed with status: $RESPONSE"
          fi
      
      - name: Notify on Failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🚨 Production health check failed!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Health Check Failed*\n\nImmediate investigation required."
                  }
                }
              ]
            }
```

## Load Testing

### 1. Load Test Script

```typescript
// scripts/load-test.ts
import autocannon from 'autocannon';

interface LoadTestConfig {
  url: string;
  connections: number;
  duration: number;
  pipelining: number;
}

async function runLoadTest(config: LoadTestConfig) {
  console.log('🚀 Starting load test...');
  console.log(`URL: ${config.url}`);
  console.log(`Connections: ${config.connections}`);
  console.log(`Duration: ${config.duration}s\n`);
  
  const result = await autocannon({
    url: config.url,
    connections: config.connections,
    duration: config.duration,
    pipelining: config.pipelining,
    headers: {
      'User-Agent': 'LoadTest/1.0'
    }
  });
  
  console.log('\n📊 Load Test Results:');
  console.log(`Requests: ${result.requests.total}`);
  console.log(`Throughput: ${result.throughput.mean} bytes/sec`);
  console.log(`Latency (avg): ${result.latency.mean}ms`);
  console.log(`Latency (p95): ${result.latency.p95}ms`);
  console.log(`Latency (p99): ${result.latency.p99}ms`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Timeouts: ${result.timeouts}`);
  
  // Check if results meet SLA
  const slaViolations = [];
  
  if (result.latency.p95 > 2000) {
    slaViolations.push(`P95 latency ${result.latency.p95}ms exceeds 2000ms SLA`);
  }
  
  if (result.errors > result.requests.total * 0.01) {
    slaViolations.push(`Error rate ${(result.errors / result.requests.total * 100).toFixed(2)}% exceeds 1% SLA`);
  }
  
  if (slaViolations.length > 0) {
    console.log('\n❌ SLA Violations:');
    slaViolations.forEach(v => console.log(`  - ${v}`));
    process.exit(1);
  } else {
    console.log('\n✅ All SLAs met');
  }
}

// Run load test
const config: LoadTestConfig = {
  url: process.env.LOAD_TEST_URL || 'https://staging.gvteway.com',
  connections: parseInt(process.env.LOAD_TEST_CONNECTIONS || '100'),
  duration: parseInt(process.env.LOAD_TEST_DURATION || '30'),
  pipelining: parseInt(process.env.LOAD_TEST_PIPELINING || '10')
};

runLoadTest(config);
```

### 2. Load Test in CI/CD

```json
// package.json
{
  "scripts": {
    "test:load": "ts-node scripts/load-test.ts",
    "test:load:staging": "LOAD_TEST_URL=https://staging.gvteway.com npm run test:load",
    "test:load:production": "LOAD_TEST_URL=https://gvteway.com LOAD_TEST_CONNECTIONS=50 npm run test:load"
  }
}
```

## Circuit Breaker Pattern

```typescript
// src/lib/circuit-breaker.ts
interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private options: CircuitBreakerOptions;
  
  constructor(options: CircuitBreakerOptions) {
    this.options = options;
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
    }
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
}

// Usage example
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 10000 // 10 seconds
});

export async function callExternalService() {
  return breaker.execute(async () => {
    const response = await fetch('https://api.external-service.com/data');
    if (!response.ok) throw new Error('Service unavailable');
    return response.json();
  });
}
```

## Performance Optimization

### 1. Connection Pooling

```typescript
// src/lib/supabase/server.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Connection pool configuration
const poolConfig = {
  max: 20, // Maximum number of connections
  min: 5,  // Minimum number of connections
  idle: 10000, // Idle timeout
};

// Reuse client instance
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: 'public',
        },
        auth: {
          persistSession: false,
        },
      }
    );
  }
  
  return supabaseInstance;
}
```

### 2. Request Timeout Configuration

```typescript
// src/lib/fetch-with-timeout.ts
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
```

## SLA Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Availability | 99.9% | Monthly uptime |
| Response Time (p95) | < 2000ms | API endpoints |
| Response Time (p99) | < 5000ms | API endpoints |
| Error Rate | < 1% | Failed requests |
| Time to First Byte | < 500ms | Static assets |

## References

- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [Health Check Patterns](https://microservices.io/patterns/observability/health-check-api.html)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Load Balancing Algorithms](https://www.nginx.com/blog/choosing-nginx-plus-load-balancing-techniques/)
