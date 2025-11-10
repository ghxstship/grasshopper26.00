'use client';

import { EventLayout } from '@/design-system/components/templates/EventLayout/EventLayout';
import { Header } from '@/design-system/components/organisms/Header/Header';
import { Footer } from '@/design-system/components/organisms/Footer/Footer';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import styles from './event-detail.module.css';

interface EventDetailClientProps {
  event: any;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <EventLayout
      header={<Header />}
      hero={
        <div className={styles.hero}>
          {event.hero_image_url && (
            <div 
              className={styles.heroImage}
              style={{ backgroundImage: `url(${event.hero_image_url})` }}
            />
          )}
          <div className={styles.heroContent}>
            <Typography variant="hero" as="h1">
              {event.name}
            </Typography>
          </div>
        </div>
      }
      details={
        <div className={styles.details}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <Calendar className={styles.detailIcon} />
              <div>
                <Typography variant="meta" as="div">Date</Typography>
                <Typography variant="body" as="div">
                  {format(new Date(event.start_date), 'MMMM d, yyyy')}
                </Typography>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <Clock className={styles.detailIcon} />
              <div>
                <Typography variant="meta" as="div">Time</Typography>
                <Typography variant="body" as="div">
                  {format(new Date(event.start_date), 'h:mm a')}
                </Typography>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <MapPin className={styles.detailIcon} />
              <div>
                <Typography variant="meta" as="div">Venue</Typography>
                <Typography variant="body" as="div">
                  {event.venue_name}
                </Typography>
              </div>
            </div>
          </div>
          
          {event.description && (
            <div className={styles.description}>
              <Typography variant="body" as="p">
                {event.description}
              </Typography>
            </div>
          )}
        </div>
      }
      lineup={
        event.artists && event.artists.length > 0 ? (
          <div className={styles.lineup}>
            <Typography variant="h2" as="h2" className={styles.sectionTitle}>
              Lineup
            </Typography>
            <div className={styles.artistsGrid}>
              {event.artists.map((artist: any) => (
                <div key={artist.id} className={styles.artistCard}>
                  <Typography variant="h4" as="div">
                    {artist.name}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        ) : null
      }
      cta={
        <div className={styles.cta}>
          <Button variant="filled" size="lg">
            Get Tickets
          </Button>
        </div>
      }
      footer={<Footer />}
    />
  );
}
