import { Suspense } from 'react';
import Link from 'next/link';
import { getEvents } from '@/lib/actions/events';
import { EventCard } from '@/design-system/components/molecules/EventCard';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Events | GVTEWAY',
  description: 'Manage your events',
};

async function EventsList() {
  const events = await getEvents();

  if (!events || events.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO EVENTS FOUND</p>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => 
    new Date(e.event_start_date) >= new Date()
  );
  
  const pastEvents = events.filter(e => 
    new Date(e.event_start_date) < new Date()
  );

  return (
    <div className={styles.content}>
      {upcomingEvents.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>UPCOMING ({upcomingEvents.length})</h2>
          <div className={styles.grid}>
            {upcomingEvents.map((event: any) => (
              <Link key={event.id} href={`/portal/events/${event.id}/dashboard`}>
                <EventCard
                  event={{
                    id: event.id,
                    name: event.event_name,
                    date: new Date(event.event_start_date).toLocaleDateString(),
                    venue: event.venue_name || 'TBD',
                    imageUrl: event.event_image_url || '/placeholder.jpg',
                    status: event.event_status === 'published' ? 'on-sale' : 'coming-soon',
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>PAST ({pastEvents.length})</h2>
          <div className={styles.grid}>
            {pastEvents.map((event: any) => (
              <Link key={event.id} href={`/portal/events/${event.id}/dashboard`}>
                <EventCard
                  event={{
                    id: event.id,
                    name: event.event_name,
                    date: new Date(event.event_start_date).toLocaleDateString(),
                    venue: event.venue_name || 'TBD',
                    imageUrl: event.event_image_url || '/placeholder.jpg',
                    status: 'coming-soon',
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>EVENTS</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <EventsList />
      </Suspense>
    </div>
  );
}
