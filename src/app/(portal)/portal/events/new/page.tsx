import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { EventForm } from '@/design-system/components/organisms/forms/EventForm';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'New Event | GVTEWAY',
  description: 'Create a new event',
};

async function NewEventForm() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <div className={styles.error}>NOT AUTHENTICATED</div>;
  }

  // Get user's organizations
  const { data: userOrgs } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!userOrgs) {
    return <div className={styles.error}>NO ORGANIZATION FOUND</div>;
  }

  // Get venues for the organization
  const { data: venues } = await supabase
    .from('venues')
    .select('id, venue_name, city')
    .eq('organization_id', userOrgs.organization_id)
    .eq('is_active', true)
    .order('venue_name');

  return (
    <EventForm 
      organizationId={userOrgs.organization_id}
      venues={venues || []}
    />
  );
}

export default function NewEventPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>NEW EVENT</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <NewEventForm />
      </Suspense>
    </div>
  );
}
