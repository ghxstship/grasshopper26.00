import { NextResponse } from 'next/server';

interface RateLimitConfig {
  requests: number;
  window: number; // in seconds
}

const rateLimits: Record<string, RateLimitConfig> = {
  auth: { requests: 5, window: 60 },
  api: { requests: 100, window: 60 },
  admin: { requests: 200, window: 60 },
  checkout: { requests: 10, window: 60 },
};

// In-memory store (use Redis in production)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function getRateLimitKey(identifier: string, endpoint: string): string {
  return `${identifier}:${endpoint}`;
}

export function getRateLimitType(pathname: string): keyof typeof rateLimits {
  if (pathname.startsWith('/api/auth')) return 'auth';
  if (pathname.startsWith('/api/admin')) return 'admin';
  if (pathname.startsWith('/api/checkout')) return 'checkout';
  return 'api';
}

export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  type: keyof typeof rateLimits = 'api'
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = getRateLimitKey(identifier, endpoint);
  const config = rateLimits[type];
  const now = Date.now();
  
  let record = requestCounts.get(key);
  
  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + config.window * 1000,
    };
  }
  
  record.count++;
  requestCounts.set(key, record);
  
  const allowed = record.count <= config.requests;
  const remaining = Math.max(0, config.requests - record.count);
  
  return {
    allowed,
    remaining,
    resetAt: record.resetAt,
  };
}

export function rateLimitResponse(resetAt: number): NextResponse {
  const response = NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  );
  
  response.headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString());
  response.headers.set('Retry-After', Math.ceil((resetAt - Date.now()) / 1000).toString());
  
  return response;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt + 60000) { // 1 minute after reset
      requestCounts.delete(key);
    }
  }
}, 60000); // Run every minute
