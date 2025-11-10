'use client';

import { useRouter } from 'next/navigation';
import { LandingLayout } from '@/design-system/components/templates/LandingLayout/LandingLayout';
import { SiteHeader } from '@/design-system/components/organisms/layout/site-header';
import { SiteFooter } from '@/design-system/components/organisms/layout/site-footer';
import { HeroSection } from '@/design-system/components/organisms/HeroSection/HeroSection';
import { EventsGrid } from '@/design-system/components/organisms/EventsGrid/EventsGrid';
import styles from './home.module.css';

export function HomeClient({ featuredEvents, upcomingEvents }: { featuredEvents: any[]; upcomingEvents: any[] }) {
  const router = useRouter();

  const mapEventData = (event: any) => ({
    id: event.id,
    name: event.name,
    date: new Date(event.start_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase(),
    venue: event.venue_name || 'TBA',
    imageUrl: event.hero_image_url || '/placeholder.jpg',
    status: (event.status || 'on-sale') as 'on-sale' | 'sold-out' | 'coming-soon',
  });

  return (
    <LandingLayout
      header={<SiteHeader />}
      hero={
        <HeroSection
          title="EXPERIENCE LIVE"
          tagline="WORLD-CLASS FESTIVALS, CONCERTS & EVENTS"
          backgroundImage="/hero-bg.jpg"
          ctaText="EXPLORE EVENTS"
          ctaHref="/events"
          variant="black"
          showScrollIndicator={true}
        />
      }
      featuredEvents={
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>FEATURED EVENTS</h2>
          <EventsGrid
            events={featuredEvents.map(mapEventData)}
            onEventClick={(id) => router.push(`/events/${id}`)}
            layout="asymmetric"
          />
        </div>
      }
      featuredArtists={
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>UPCOMING EVENTS</h2>
          <EventsGrid
            events={upcomingEvents.map(mapEventData)}
            onEventClick={(id) => router.push(`/events/${id}`)}
            layout="grid"
          />
        </div>
      }
      footer={<SiteFooter />}
    />
  );
}
