/**
 * DDoS Protection and Traffic Analysis
 * 
 * Provides additional layer of protection beyond Vercel's built-in DDoS mitigation
 * Implements adaptive rate limiting and traffic pattern analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/monitoring/logger';

interface TrafficPattern {
  ip: string;
  requestCount: number;
  firstSeen: number;
  lastSeen: number;
  paths: Map<string, number>;
  userAgents: Set<string>;
  suspicious: boolean;
}

// In-memory traffic analysis (use Redis in production)
const trafficPatterns = new Map<string, TrafficPattern>();

// Suspicious patterns
const SUSPICIOUS_PATTERNS = {
  // Too many requests in short time
  BURST_THRESHOLD: 50, // requests
  BURST_WINDOW: 10000, // 10 seconds
  
  // Too many different paths
  PATH_DIVERSITY_THRESHOLD: 20,
  
  // Repeated failed requests
  FAILED_REQUEST_THRESHOLD: 10,
  
  // Known bot patterns
  BOT_USER_AGENTS: [
    'curl',
    'wget',
    'python-requests',
    'go-http-client',
    'scrapy',
    'bot',
    'crawler',
    'spider',
  ],
};

export interface DDoSConfig {
  enabled: boolean;
  blockSuspiciousIPs: boolean;
  logOnly: boolean;
  whitelistedIPs?: string[];
  whitelistedPaths?: string[];
}

const DEFAULT_CONFIG: DDoSConfig = {
  enabled: true,
  blockSuspiciousIPs: true,
  logOnly: false,
  whitelistedIPs: [],
  whitelistedPaths: ['/api/health', '/api/status'],
};

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  return (
    cfConnectingIP ||
    forwarded?.split(',')[0]?.trim() ||
    realIP ||
    'unknown'
  );
}

/**
 * Analyze traffic pattern for suspicious activity
 */
function analyzeTrafficPattern(
  ip: string,
  path: string,
  userAgent: string | null
): { suspicious: boolean; reason?: string } {
  const now = Date.now();
  let pattern = trafficPatterns.get(ip);

  if (!pattern) {
    pattern = {
      ip,
      requestCount: 0,
      firstSeen: now,
      lastSeen: now,
      paths: new Map(),
      userAgents: new Set(),
      suspicious: false,
    };
    trafficPatterns.set(ip, pattern);
  }

  // Update pattern
  pattern.requestCount++;
  pattern.lastSeen = now;
  pattern.paths.set(path, (pattern.paths.get(path) || 0) + 1);
  if (userAgent) {
    pattern.userAgents.add(userAgent);
  }

  // Check for burst traffic
  const timeSinceFirst = now - pattern.firstSeen;
  if (
    timeSinceFirst < SUSPICIOUS_PATTERNS.BURST_WINDOW &&
    pattern.requestCount > SUSPICIOUS_PATTERNS.BURST_THRESHOLD
  ) {
    pattern.suspicious = true;
    return {
      suspicious: true,
      reason: `Burst traffic: ${pattern.requestCount} requests in ${timeSinceFirst}ms`,
    };
  }

  // Check for path scanning
  if (pattern.paths.size > SUSPICIOUS_PATTERNS.PATH_DIVERSITY_THRESHOLD) {
    pattern.suspicious = true;
    return {
      suspicious: true,
      reason: `Path scanning: ${pattern.paths.size} unique paths`,
    };
  }

  // Check for bot user agents
  if (userAgent) {
    const lowerUA = userAgent.toLowerCase();
    const isBot = SUSPICIOUS_PATTERNS.BOT_USER_AGENTS.some((bot) =>
      lowerUA.includes(bot)
    );
    if (isBot && pattern.requestCount > 5) {
      pattern.suspicious = true;
      return {
        suspicious: true,
        reason: `Bot detected: ${userAgent}`,
      };
    }
  }

  return { suspicious: false };
}

/**
 * Clean up old traffic patterns
 */
function cleanupTrafficPatterns(): void {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 60 * 60 * 1000; // 1 hour

  for (const [ip, pattern] of trafficPatterns.entries()) {
    if (now - pattern.lastSeen > CLEANUP_THRESHOLD) {
      trafficPatterns.delete(ip);
    }
  }
}

/**
 * DDoS protection middleware
 */
export async function ddosProtection(
  req: NextRequest,
  config: Partial<DDoSConfig> = {}
): Promise<NextResponse | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.enabled) {
    return null;
  }

  // Periodic cleanup
  if (Math.random() < 0.01) {
    cleanupTrafficPatterns();
  }

  const ip = getClientIP(req);
  const path = req.nextUrl.pathname;
  const userAgent = req.headers.get('user-agent');

  // Check whitelist
  if (finalConfig.whitelistedIPs?.includes(ip)) {
    return null;
  }

  if (finalConfig.whitelistedPaths?.some((p) => path.startsWith(p))) {
    return null;
  }

  // Analyze traffic
  const analysis = analyzeTrafficPattern(ip, path, userAgent);

  if (analysis.suspicious) {
    logger.logSecurityEvent(
      'Suspicious traffic detected',
      'high',
      {
        ip,
        path,
        userAgent: userAgent || 'unknown',
        reason: analysis.reason,
      }
    );

    // Block if configured
    if (finalConfig.blockSuspiciousIPs && !finalConfig.logOnly) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Your IP has been temporarily blocked due to suspicious activity',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '3600',
          },
        }
      );
    }
  }

  return null;
}

/**
 * Get traffic statistics
 */
export function getTrafficStats(): {
  totalIPs: number;
  suspiciousIPs: number;
  topPaths: Array<{ path: string; count: number }>;
  topIPs: Array<{ ip: string; count: number }>;
} {
  const pathCounts = new Map<string, number>();
  let suspiciousCount = 0;

  for (const pattern of trafficPatterns.values()) {
    if (pattern.suspicious) {
      suspiciousCount++;
    }

    for (const [path, count] of pattern.paths.entries()) {
      pathCounts.set(path, (pathCounts.get(path) || 0) + count);
    }
  }

  const topPaths = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  const topIPs = Array.from(trafficPatterns.values())
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 10)
    .map((p) => ({ ip: p.ip, count: p.requestCount }));

  return {
    totalIPs: trafficPatterns.size,
    suspiciousIPs: suspiciousCount,
    topPaths,
    topIPs,
  };
}

/**
 * Block an IP address manually
 */
export function blockIP(ip: string, reason: string): void {
  const pattern = trafficPatterns.get(ip);
  if (pattern) {
    pattern.suspicious = true;
  } else {
    trafficPatterns.set(ip, {
      ip,
      requestCount: 0,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      paths: new Map(),
      userAgents: new Set(),
      suspicious: true,
    });
  }

  logger.logSecurityEvent('IP manually blocked', 'high', { ip, reason });
}

/**
 * Unblock an IP address
 */
export function unblockIP(ip: string): void {
  trafficPatterns.delete(ip);
  logger.logSecurityEvent('IP unblocked', 'low', { ip });
}

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip: string): boolean {
  const pattern = trafficPatterns.get(ip);
  return pattern?.suspicious || false;
}
