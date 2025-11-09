import { NextRequest, NextResponse } from 'next/server';
/* eslint-disable no-magic-numbers */
// CSRF token generation constants (byte lengths, TTL)
import { cookies } from 'next/headers';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

/**
 * Generate a CSRF token using Web Crypto API (Edge Runtime compatible)
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(req: NextRequest): boolean {
  // Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true;
  }

  // Get token from header
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  
  // Get token from cookie
  const cookieToken = req.cookies.get(CSRF_TOKEN_NAME)?.value;

  // Both must exist and match
  if (!headerToken || !cookieToken) {
    return false;
  }

  // Simple comparison (for Edge Runtime compatibility)
  // In production, consider using a timing-safe comparison library
  return headerToken === cookieToken;
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(req: NextRequest): Promise<NextResponse | null> {
  // Skip CSRF for API routes that use other auth methods
  const path = req.nextUrl.pathname;
  
  // Skip for webhooks and public endpoints
  if (
    path.startsWith('/api/webhooks/') ||
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/register') ||
    path.startsWith('/api/auth/reset-password')
  ) {
    return null;
  }

  // Verify CSRF token
  if (!verifyCSRFToken(req)) {
    return NextResponse.json(
      {
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Invalid or missing CSRF token',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Set CSRF token cookie in response
 */
export async function setCSRFTokenCookie(response: NextResponse): Promise<void> {
  const token = generateCSRFToken();
  
  response.cookies.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  // Also set in header for client to read
  response.headers.set(CSRF_HEADER_NAME, token);
}

/**
 * Get CSRF token for client-side use
 */
export async function getCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value;
}

/**
 * Middleware to add CSRF token to response
 */
export function withCSRFToken(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);
    await setCSRFTokenCookie(response);
    return response;
  };
}
