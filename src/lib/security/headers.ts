/* eslint-disable no-magic-numbers */
// Security header constants (nonce lengths, max-age values)
import { NextResponse } from 'next/server';

/**
 * Security headers middleware
 * Implements OWASP security best practices
 */

export function setSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Strict Transport Security (HSTS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
  ].join(', ');
  response.headers.set('Permissions-Policy', permissionsPolicy);

  // Remove X-Powered-By header
  response.headers.delete('X-Powered-By');

  return response;
}

/**
 * Apply security headers (alias for setSecurityHeaders)
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  return setSecurityHeaders(response);
}

/**
 * CORS headers for API routes
 */
export function setCORSHeaders(
  response: NextResponse,
  allowedOrigins: string[] = []
): NextResponse {
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  if (allowedOrigins.length > 0) {
    // Check if origin is allowed
    const requestOrigin = response.headers.get('origin');
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin);
    }
  } else {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
  );
  
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * CSRF token generation and validation
 */
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly HEADER_NAME = 'X-CSRF-Token';
  private static readonly COOKIE_NAME = 'csrf_token';

  static generateToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static setToken(response: NextResponse): NextResponse {
    const token = this.generateToken();
    
    response.cookies.set(this.COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  }

  static validateToken(request: Request): boolean {
    // Skip CSRF validation for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    const headerToken = request.headers.get(this.HEADER_NAME);
    const cookieToken = this.getCookieToken(request);

    if (!headerToken || !cookieToken) {
      return false;
    }

    return headerToken === cookieToken;
  }

  private static getCookieToken(request: Request): string | null {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map(c => c.trim());
    const csrfCookie = cookies.find(c => c.startsWith(`${this.COOKIE_NAME}=`));
    
    return csrfCookie ? csrfCookie.split('=')[1] : null;
  }
}

/**
 * Rate limiting headers
 */
export function setRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());

  if (remaining === 0) {
    response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
  }

  return response;
}

/**
 * Cache control headers
 */
export function setCacheHeaders(
  response: NextResponse,
  options: {
    maxAge?: number;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
    public?: boolean;
    immutable?: boolean;
  } = {}
): NextResponse {
  const {
    maxAge = 0,
    sMaxAge,
    staleWhileRevalidate,
    public: isPublic = false,
    immutable = false,
  } = options;

  const directives: string[] = [];

  if (isPublic) {
    directives.push('public');
  } else {
    directives.push('private');
  }

  if (maxAge > 0) {
    directives.push(`max-age=${maxAge}`);
  } else {
    directives.push('no-cache', 'no-store', 'must-revalidate');
  }

  if (sMaxAge) {
    directives.push(`s-maxage=${sMaxAge}`);
  }

  if (staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  if (immutable) {
    directives.push('immutable');
  }

  response.headers.set('Cache-Control', directives.join(', '));

  return response;
}
