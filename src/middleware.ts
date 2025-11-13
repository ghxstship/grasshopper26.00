import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { applySecurityHeaders } from '@/lib/security/headers'
import { csrfProtection } from '@/lib/security/csrf'
import { createServerClient } from '@supabase/ssr'

async function getUserRole(request: NextRequest): Promise<string | null> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    );
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
    const { data: orgAssignment } = await supabase
      .from('brand_team_assignments')
      .select('team_role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();
    
    if (orgAssignment && ['super_admin', 'admin'].includes(orgAssignment.team_role)) {
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
  
  // Skip subdomain routing in local development
  const isLocalDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  
  // Subdomain routing: app.gvteway.xyz for authenticated dashboards
  if (!isLocalDev && hostname.startsWith('app.')) {
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
          url.pathname = '/legend/dashboard';
          break;
        case 'org_admin':
          url.pathname = '/organization/dashboard';
          break;
        case 'staff':
          url.pathname = '/team/dashboard';
          break;
        case 'member':
        default:
          url.pathname = '/member/dashboard';
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
  } else if (!isLocalDev) {
    // Main domain: block authenticated dashboard routes
    const dashboardRoutes = ['/legend', '/organization', '/member', '/team'];
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
