import { Suspense } from 'react';
import { VenueCard } from '@/design-system/components/molecules/VenueCard';
import { Button } from '@/design-system/components/atoms/Button';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';

export const metadata = {
  title: 'Venues | GVTEWAY',
  description: 'Manage venues',
};

async function VenuesList() {
  const supabase = await createClient();
  
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .order('venue_name');

  if (error) throw error;

  if (!venues || venues.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO VENUES FOUND</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {venues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          href={`/portal/venues/${venue.id}`}
        />
      ))}
    </div>
  );
}

export default function VenuesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>VENUES</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <VenuesList />
      </Suspense>
    </div>
  );
}
