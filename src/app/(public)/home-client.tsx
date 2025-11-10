'use client';

import { PortalDashboardTemplate } from '@/design-system/components/templates';
import { Calendar, Users, Ticket } from 'lucide-react';
import { EventCard } from '@/design-system/components/organisms/events/event-card';
import styles from './home.module.css';

export function HomeClient({ featuredEvents, upcomingEvents }: { featuredEvents: any[]; upcomingEvents: any[] }) {
  return (
    <PortalDashboardTemplate
      greeting="Welcome to GVTEWAY"
      userInfo={<span>Exclusive events and experiences</span>}
      statsCards={[
        { label: 'Featured Events', value: featuredEvents.length, icon: <Calendar /> },
        { label: 'Upcoming', value: upcomingEvents.length, icon: <Ticket /> },
        { label: 'Members', value: '10K+', icon: <Users /> },
      ]}
      sections={[
        {
          id: 'featured',
          title: 'Featured Events',
          content: (
            <div className={styles.featuredEventsGrid}>
              {featuredEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          ),
        },
        {
          id: 'upcoming',
          title: 'Upcoming Events',
          content: (
            <div className={styles.upcomingEventsGrid}>
              {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          ),
        },
      ]}
      layout="single-column"
    />
  );
}
