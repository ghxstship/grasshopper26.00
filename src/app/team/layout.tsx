import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Team Dashboard Layout
 * External Staff & Day of Show Staff Access
 * Event-specific operations, check-ins, scanning
 */
export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/team');
  }

  // Check if user has staff assignment
  const { data: assignments, error: assignmentError } = await supabase
    .from('event_team_assignments')
    .select('id')
    .eq('user_id', user.id)
    .is('removed_at', null)
    .limit(1);

  if (assignmentError) {
    console.error('Error checking staff assignment:', assignmentError);
    redirect('/');
  }

  if (!assignments || assignments.length === 0) {
    redirect('/');
  }

  return <>{children}</>;
}
