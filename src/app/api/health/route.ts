import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { performHealthCheck } from '@/lib/monitoring/uptime';
import { getQueryStats } from '@/lib/monitoring/database-monitor';

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
  metrics?: {
    database?: {
      avgQueryDuration: number;
      queryCount: number;
      errorRate: number;
    };
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const detailed = searchParams.get('detailed') === 'true';
  
  // Use comprehensive health check if detailed
  if (detailed) {
    const health = await performHealthCheck();
    
    // Convert to legacy format for compatibility
    const checks: HealthCheck[] = Object.entries(health.checks).map(([service, check]) => ({
      service,
      status: check.status === 'pass' ? 'healthy' : check.status === 'warn' ? 'degraded' : 'unhealthy',
      latency: check.duration || 0,
      details: check.message,
    }));
    
    const response: HealthResponse = {
      status: health.status,
      timestamp: health.timestamp.toISOString(),
      environment: process.env.VERCEL_ENV || 'development',
      version: health.version,
      uptime: health.uptime,
      checks,
      metrics: {
        database: {
          avgQueryDuration: getQueryStats().avgDuration,
          queryCount: getQueryStats().count,
          errorRate: getQueryStats().errorRate,
        },
      },
    };
    
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': health.status,
      },
    });
  }
  
  // Simple health check (legacy)
  const startTime = Date.now();
  const checks: HealthCheck[] = [];
  
  // 1. Database Health Check
  const dbCheck = await checkDatabase();
  checks.push(dbCheck);
  
  // 2. Storage Health Check
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
    const supabase = await createClient();
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    const latency = Date.now() - start;
    
    if (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        latency,
        details: error.message
      };
    }
    
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

async function checkStorage(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase
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
