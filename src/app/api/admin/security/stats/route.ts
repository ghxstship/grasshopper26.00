/**
 * Security Statistics API
 * 
 * Provides security monitoring statistics and metrics
 * Admin-only endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityStats, getRecentSecurityEvents } from '@/lib/security/security-monitor';
import { getTrafficStats } from '@/lib/security/ddos-protection';
import { getSecretMetadata } from '@/lib/security/secrets-manager';
import { createClient } from '@/lib/supabase/server';
import { ErrorResponses } from '@/lib/api/error-handler';

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw ErrorResponses.unauthorized();
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw ErrorResponses.forbidden('Admin access required');
    }

    // Get time window from query params (default 24 hours)
    const url = new URL(req.url);
    const hours = parseInt(url.searchParams.get('hours') || '24', 10);
    const timeWindow = hours * 60 * 60 * 1000;

    // Gather security statistics
    const securityStats = getSecurityStats(timeWindow);
    const trafficStats = getTrafficStats();
    const recentEvents = getRecentSecurityEvents(undefined, 50);
    const secretsMetadata = getSecretMetadata();

    // Calculate health score
    const healthScore = calculateSecurityHealth(securityStats, trafficStats, secretsMetadata);

    return NextResponse.json({
      success: true,
      data: {
        timeWindow: {
          hours,
          start: new Date(Date.now() - timeWindow).toISOString(),
          end: new Date().toISOString(),
        },
        security: {
          ...securityStats,
          recentEvents: recentEvents.slice(0, 10), // Last 10 events
        },
        traffic: trafficStats,
        secrets: {
          total: secretsMetadata.length,
          required: secretsMetadata.filter(s => s.required).length,
          encrypted: secretsMetadata.filter(s => s.encrypted).length,
          missing: secretsMetadata.filter(s => s.required && !s.present).length,
        },
        health: healthScore,
      },
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    
    // If it's already an APIError, rethrow it
    if (error instanceof Error && error.name === 'APIError') {
      throw error;
    }
    
    // Otherwise, throw a database error
    throw ErrorResponses.databaseError('Failed to fetch security statistics');
  }
}

/**
 * Calculate overall security health score
 */
function calculateSecurityHealth(
  securityStats: any,
  trafficStats: any,
  secretsMetadata: any[]
): {
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  issues: string[];
} {
  let score = 100;
  const issues: string[] = [];

  // Check for critical security events
  const criticalEvents = securityStats.eventsBySeverity?.critical || 0;
  if (criticalEvents > 0) {
    score -= 30;
    issues.push(`${criticalEvents} critical security events detected`);
  }

  // Check for high severity events
  const highEvents = securityStats.eventsBySeverity?.high || 0;
  if (highEvents > 5) {
    score -= 20;
    issues.push(`${highEvents} high severity events detected`);
  }

  // Check for suspicious traffic
  if (trafficStats.suspiciousIPs > 0) {
    score -= 10;
    issues.push(`${trafficStats.suspiciousIPs} suspicious IPs detected`);
  }

  // Check for missing required secrets
  const missingSecrets = secretsMetadata.filter(s => s.required && !s.present);
  if (missingSecrets.length > 0) {
    score -= 25;
    issues.push(`${missingSecrets.length} required secrets missing`);
  }

  // Determine status
  let status: 'excellent' | 'good' | 'warning' | 'critical';
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'warning';
  else status = 'critical';

  return {
    score: Math.max(0, score),
    status,
    issues,
  };
}
