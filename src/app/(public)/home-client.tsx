'use client';

import { useRouter } from 'next/navigation';
import { LandingLayout } from '@/design-system/components/templates/LandingLayout/LandingLayout';
import { SiteHeader } from '@/design-system/components/organisms/layout/site-header';
import { HeroSection } from '@/design-system/components/organisms/HeroSection/HeroSection';
import { EventsGrid } from '@/design-system/components/organisms/EventsGrid/EventsGrid';
import { Carousel } from '@/design-system/components/organisms/Carousel/Carousel';
import { NewsletterSignup } from '@/design-system/components/organisms/NewsletterSignup/NewsletterSignup';
import { EventCard } from '@/design-system/components/organisms/EventCard/EventCard';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { toast } from 'sonner';
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

  const handleNewsletterSubmit = async (email: string) => {
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) throw new Error('Failed to subscribe');
      toast.success('Successfully subscribed to newsletter!');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
      throw error;
    }
  };

  return (
    <LandingLayout
      header={<SiteHeader />}
      hero={
        <HeroSection
          title="EXPERIENCE LIVE"
          tagline="WORLD-CLASS FESTIVALS, CONCERTS & EVENTS"
          ctaText="EXPLORE EVENTS"
          ctaHref="/events"
          variant="black"
          showScrollIndicator={true}
        />
      }
      featuredEvents={
        featuredEvents.length > 0 ? (
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Featured Events</h2>
            <Carousel
              showNavigation
              showDots
              autoplayInterval={6000}
              loop
            >
              {featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.name}
                  description={event.description}
                  imageUrl={event.hero_image_url || '/placeholder.jpg'}
                  imageAlt={event.name}
                  date={new Date(event.start_date).toLocaleDateString()}
                  location={event.venue_name || 'TBA'}
                  href={`/events/${event.slug}`}
                />
              ))}
            </Carousel>
          </div>
        ) : undefined
      }
      featuredArtists={
        upcomingEvents.length > 0 ? (
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
            <EventsGrid
              events={upcomingEvents.map(mapEventData)}
              onEventClick={(id) => router.push(`/events/${id}`)}
              layout="grid"
            />
            <div className={styles.sectionCta}>
              <Button
                variant="outlined"
                size="lg"
                onClick={() => router.push('/events')}
              >
                View All Events
              </Button>
            </div>
          </div>
        ) : undefined
      }
      membershipTiers={
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Become a Member</h2>
          <p className={styles.sectionDescription}>
            Unlock exclusive access to presales, VIP experiences, and member-only events
          </p>
          <div className={styles.sectionCta}>
            <Button
              variant="filled"
              size="lg"
              onClick={() => router.push('/membership')}
            >
              Explore Membership
            </Button>
          </div>
        </div>
      }
      newsletter={
        <div className={styles.newsletterContainer}>
          <h2 className={styles.newsletterTitle}>Stay in the Loop</h2>
          <p className={styles.newsletterDescription}>
            Get the latest event announcements, exclusive offers, and insider news
          </p>
          <NewsletterSignup
            onSubmit={handleNewsletterSubmit}
            variant="black"
          />
        </div>
      }
    />
  );
}
