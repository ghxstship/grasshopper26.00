import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Portal Landing Page
 * Redirects authenticated users to their appropriate dashboard based on role
 */
export default async function PortalPage() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // If not authenticated, redirect to login
  if (authError || !user) {
    redirect('/login');
  }
  
  try {
    // Check for platform admin (Legend access)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_platform_admin')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }
    
    if (profile?.is_platform_admin) {
      redirect('/legend/dashboard');
    }
    
    // Check for organization admin
    const { data: orgAssignment, error: orgError } = await supabase
      .from('brand_team_assignments')
      .select('team_role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();
    
    if (orgError) {
      console.error('Error fetching organization assignment:', orgError);
    }
    
    if (orgAssignment && ['super_admin', 'admin'].includes(orgAssignment.team_role)) {
      redirect('/organization/dashboard');
    }
    
    // Check for event staff
    const { data: staffAssignment, error: staffError } = await supabase
      .from('event_team_assignments')
      .select('id')
      .eq('user_id', user.id)
      .is('removed_at', null)
      .limit(1)
      .maybeSingle();
    
    if (staffError) {
      console.error('Error fetching staff assignment:', staffError);
    }
    
    if (staffAssignment) {
      redirect('/team/dashboard');
    }
    
    // Default to member dashboard
    redirect('/member/dashboard');
  } catch (error) {
    console.error('Error determining user role:', error);
    // Default to member dashboard on error
    redirect('/member/dashboard');
  }
}
