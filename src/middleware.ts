import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { applySecurityHeaders } from '@/lib/security/headers'
import { csrfProtection } from '@/lib/security/csrf'
import { createClient } from '@/lib/supabase/server'

async function getUserRole(request: NextRequest): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Check for platform admin (Legend access)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_platform_admin')
      .eq('id', user.id)
      .single();
    
    if (profile?.is_platform_admin) return 'platform_admin';
    
    // Check for organization admin
    const { data: brandUser } = await supabase
      .from('brand_users')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (brandUser && ['admin', 'super_admin'].includes(brandUser.role)) {
      return 'org_admin';
    }
    
    // Check for event staff
    const { data: staffAssignment } = await supabase
      .from('event_team_assignments')
      .select('id')
      .eq('user_id', user.id)
      .is('removed_at', null)
      .limit(1)
      .single();
    
    if (staffAssignment) return 'staff';
    
    // Default to member
    return 'member';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Subdomain routing: app.gvteway.xyz for authenticated dashboards
  if (hostname.startsWith('app.')) {
    // Role-based routing for root path on app subdomain
    if (url.pathname === '/') {
      const role = await getUserRole(request);
      
      if (!role) {
        // Not authenticated, redirect to login
        url.pathname = '/login';
        url.searchParams.set('redirect', '/');
        return NextResponse.redirect(url);
      }
      
      // Route based on role
      switch (role) {
        case 'platform_admin':
          url.pathname = '/'; // Legend dashboard (route group, no prefix)
          break;
        case 'org_admin':
          url.pathname = '/organization';
          break;
        case 'staff':
          url.pathname = '/team/staff/dashboard';
          break;
        case 'member':
        default:
          url.pathname = '/member/portal';
          break;
      }
      
      return NextResponse.redirect(url);
    }
    
    // Block public routes on app subdomain
    const publicRoutes = ['/events', '/shop', '/music', '/news', '/adventures', '/membership'];
    if (publicRoutes.some(route => url.pathname.startsWith(route))) {
      // Redirect to main domain
      url.host = hostname.replace('app.', '');
      return NextResponse.redirect(url);
    }
  } else {
    // Main domain: block authenticated dashboard routes
    const dashboardRoutes = ['/organization', '/member', '/team'];
    if (dashboardRoutes.some(route => url.pathname.startsWith(route))) {
      // Redirect to app subdomain
      url.host = `app.${hostname}`;
      return NextResponse.redirect(url);
    }
  }
  
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
