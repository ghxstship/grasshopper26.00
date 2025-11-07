import { NextRequest } from 'next/server';
import { ErrorResponses } from './error-handler';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

// Default configurations for different endpoint types
export const RateLimitPresets = {
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // Standard API limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  
  // Generous limits for read operations
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  
  // Stricter limits for write operations
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  
  // Very strict for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  },
  
  // File upload limits
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
};

// Generate rate limit key from request
function getDefaultKey(req: NextRequest): string {
  // Try to get user ID from auth
  const userId = req.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown';
  
  return `ip:${ip}`;
}

// Clean up expired entries
function cleanupStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Rate limiter middleware
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<void> {
  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance
    cleanupStore();
  }

  const key = config.keyGenerator
    ? config.keyGenerator(req)
    : getDefaultKey(req);
  
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return;
  }

  // Increment count
  record.count++;

  if (record.count > config.maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    throw ErrorResponses.rateLimitExceeded(retryAfter);
  }
}

// Rate limiter decorator for route handlers
export function withRateLimit(config: RateLimitConfig) {
  return function <T>(
    handler: (req: NextRequest, context?: any) => Promise<T>
  ) {
    return async (req: NextRequest, context?: any): Promise<T> => {
      await rateLimit(req, config);
      return handler(req, context);
    };
  };
}

// Per-user rate limiter (requires authentication)
export async function rateLimitPerUser(
  userId: string,
  config: RateLimitConfig
): Promise<void> {
  const key = `user:${userId}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return;
  }

  record.count++;

  if (record.count > config.maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    throw ErrorResponses.rateLimitExceeded(retryAfter);
  }
}

// Get rate limit status
export function getRateLimitStatus(
  req: NextRequest,
  config: RateLimitConfig
): {
  limit: number;
  remaining: number;
  resetAt: number;
} {
  const key = config.keyGenerator
    ? config.keyGenerator(req)
    : getDefaultKey(req);
  
  const record = rateLimitStore.get(key);
  const now = Date.now();

  if (!record || record.resetAt < now) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }

  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetAt: record.resetAt,
  };
}

// Add rate limit headers to response
export function addRateLimitHeaders(
  headers: Headers,
  status: {
    limit: number;
    remaining: number;
    resetAt: number;
  }
): void {
  headers.set('X-RateLimit-Limit', status.limit.toString());
  headers.set('X-RateLimit-Remaining', status.remaining.toString());
  headers.set('X-RateLimit-Reset', status.resetAt.toString());
}

// Reset rate limit for a specific key (admin function)
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// Get all rate limit records (admin function)
export function getAllRateLimits(): Map<string, { count: number; resetAt: number }> {
  return new Map(rateLimitStore);
}

// Clear all rate limits (admin function)
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
