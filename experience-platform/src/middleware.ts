import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { applySecurityHeaders } from '@/lib/security/headers'
import { csrfProtection } from '@/lib/security/csrf'

export async function middleware(request: NextRequest) {
  // Apply CSRF protection for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const csrfError = await csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }
  }

  // Update Supabase session
  const response = await updateSession(request);
  
  // Apply security headers to all responses
  applySecurityHeaders(response);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
