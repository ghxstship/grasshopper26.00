import { Suspense } from 'react';
import { Spinner, Card } from '@/design-system';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
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

  if (error) {
    console.error('Error fetching venues:', error);
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>ERROR LOADING VENUES</p>
        <p className={styles.emptyText}>{error.message}</p>
      </div>
    );
  }

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
        <Link key={venue.id} href={`/legend/venues/${venue.id}`} className={styles.link}>
          <Card>
            <h3 className={styles.venueTitle}>
              {venue.venue_name}
            </h3>
            <p className={styles.venueInfo}>
              {venue.city}, {venue.state}
            </p>
            <p className={styles.venueCapacity}>
              Capacity: {venue.max_capacity.toLocaleString()}
            </p>
          </Card>
        </Link>
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

      <Suspense fallback={<Spinner />}>
        <VenuesList />
      </Suspense>
    </div>
  );
}
