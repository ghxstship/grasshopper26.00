'use client';

import { EventLayout } from '@/design-system/components/templates/EventLayout/EventLayout';
import { Breadcrumb } from '@/design-system/components/atoms/Breadcrumb/Breadcrumb';
import { ShareButton } from '@/design-system/components/atoms/ShareButton/ShareButton';
import { Countdown } from '@/design-system/components/atoms/Countdown/Countdown';
import { Badge } from '@/design-system/components/atoms/Badge/Badge';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { CapacityIndicator } from '@/design-system/components/atoms/CapacityIndicator/CapacityIndicator';
import { PriceDisplay } from '@/design-system/components/atoms/PriceDisplay/PriceDisplay';
import { DateDisplay } from '@/design-system/components/atoms/DateDisplay/DateDisplay';
import { Chip } from '@/design-system/components/atoms/Chip/Chip';
import { Tooltip } from '@/design-system/components/atoms/Tooltip/Tooltip';
import { Gallery } from '@/design-system/components/organisms/Gallery/Gallery';
import { Calendar, MapPin, Clock, Ticket, Info } from 'lucide-react';
import { format, isFuture } from 'date-fns';
import styles from './event-detail.module.css';

export function EventDetailClient({ event }: { event: any }) {
  const eventDate = new Date(event.start_date);
  const isUpcoming = isFuture(eventDate);
  
  const minPrice = event.ticket_types && event.ticket_types.length > 0
    ? Math.min(...event.ticket_types.map((tt: any) => parseFloat(tt.price)))
    : null;

  const soldTickets = event.ticket_types?.reduce((sum: number, tt: any) => sum + tt.quantity_sold, 0) || 0;
  const totalTickets = event.ticket_types?.reduce((sum: number, tt: any) => sum + tt.quantity_available, 0) || event.capacity;
  const capacityPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

  // Gallery images
  const galleryImages = event.gallery_images?.map((img: any, idx: number) => ({
    id: img.id || `img-${idx}`,
    type: 'image' as const,
    url: img.image_url,
    alt: img.caption || event.name,
    caption: img.caption,
  })) || [];

  return (
    <EventLayout
      header={
        <div className={styles.headerBar}>
          <Breadcrumb
            items={[
              { label: 'Events', href: '/events' },
              { label: event.name },
            ]}
          />
          <ShareButton
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={event.name}
          />
        </div>
      }
      hero={
        <div className={styles.hero}>
          {event.hero_image_url && (
            <div className={styles.heroImage}>
              <img src={event.hero_image_url} alt={event.name} />
            </div>
          )}
          <div className={styles.heroContent}>
            <div className={styles.heroMeta}>
              <Badge variant={event.status === 'on_sale' ? 'on-sale' : 'default'}>
                {event.status?.replace('_', ' ').toUpperCase() || 'EVENT'}
              </Badge>
              {isUpcoming && (
                <Typography variant="body" as="span" className={styles.heroDate}>
                  <Calendar style={{ width: 16, height: 16 }} />
                  {format(eventDate, 'EEEE, MMMM d, yyyy')}
                </Typography>
              )}
            </div>
            
            <Typography variant="h1" as="h1" className={styles.heroTitle}>
              {event.name}
            </Typography>
            
            {event.tagline && (
              <Typography variant="h3" as="p" className={styles.heroTagline}>
                {event.tagline}
              </Typography>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className={styles.heroTags}>
                {event.tags.slice(0, 5).map((tag: string, idx: number) => (
                  <Chip key={idx} label={tag} size="sm" />
                ))}
              </div>
            )}

            {isUpcoming && (
              <div className={styles.countdown}>
                <Countdown targetDate={eventDate} />
              </div>
            )}
          </div>
        </div>
      }
      details={
        <div className={styles.details}>
          <div className={styles.detailsMain}>
            <Typography variant="h2" as="h2">
              About This Event
            </Typography>
            <Typography variant="body" as="div" className={styles.description}>
              {event.description}
            </Typography>

            {event.event_artists && event.event_artists.length > 0 && (
              <div className={styles.artistsSection}>
                <Typography variant="h3" as="h3">
                  Lineup
                </Typography>
                <div className={styles.artistsList}>
                  {event.event_artists
                    .sort((a: any, b: any) => a.performance_order - b.performance_order)
                    .map((ea: any) => (
                      <div key={ea.artist.id} className={styles.artistItem}>
                        {ea.artist.profile_image_url && (
                          <img 
                            src={ea.artist.profile_image_url} 
                            alt={ea.artist.name}
                            className={styles.artistImage}
                          />
                        )}
                        <div>
                          <Typography variant="h4" as="h4">
                            {ea.artist.name}
                            {ea.headliner && <Badge variant="filled">HEADLINER</Badge>}
                          </Typography>
                          {ea.artist.genre_tags && (
                            <Typography variant="body" as="p" className={styles.artistGenres}>
                              {ea.artist.genre_tags.join(', ')}
                            </Typography>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.detailsSidebar}>
            <div className={styles.infoCard}>
              <Typography variant="h3" as="h3">
                Event Details
              </Typography>
              
              <div className={styles.infoItem}>
                <Calendar style={{ width: 20, height: 20 }} />
                <div>
                  <Typography variant="body" as="p" className={styles.infoLabel}>
                    Date & Time
                  </Typography>
                  <DateDisplay date={event.start_date} format="full" />
                  {event.end_date && (
                    <>
                      <Typography variant="body" as="span"> to </Typography>
                      <DateDisplay date={event.end_date} format="full" />
                    </>
                  )}
                </div>
              </div>

              <div className={styles.infoItem}>
                <MapPin style={{ width: 20, height: 20 }} />
                <div>
                  <Typography variant="body" as="p" className={styles.infoLabel}>
                    Venue
                  </Typography>
                  <Typography variant="body" as="p">
                    {event.venue_name}
                  </Typography>
                  {event.venue_address && (
                    <Typography variant="body" as="p" className={styles.infoAddress}>
                      {event.venue_address}
                    </Typography>
                  )}
                </div>
              </div>

              {event.capacity && (
                <div className={styles.infoItem}>
                  <Ticket style={{ width: 20, height: 20 }} />
                  <div>
                    <div className={styles.infoLabelWithTooltip}>
                      <Typography variant="body" as="p" className={styles.infoLabel}>
                        Capacity
                      </Typography>
                      <Tooltip content="Shows tickets sold vs total capacity">
                        <Info style={{ width: 16, height: 16 }} />
                      </Tooltip>
                    </div>
                    <CapacityIndicator
                      current={soldTickets}
                      max={totalTickets}
                      showPercentage
                    />
                  </div>
                </div>
              )}

              {minPrice && (
                <div className={styles.priceSection}>
                  <Typography variant="body" as="p" className={styles.infoLabel}>
                    Starting at
                  </Typography>
                  <PriceDisplay amount={minPrice} size="lg" />
                </div>
              )}
            </div>
          </div>
        </div>
      }
      gallery={
        galleryImages.length > 0 ? (
          <div className={styles.gallerySection}>
            <Typography variant="h2" as="h2">
              Gallery
            </Typography>
            <Gallery items={galleryImages} layout="grid" />
          </div>
        ) : undefined
      }
      cta={
        isUpcoming && event.status === 'on_sale' ? (
          <div className={styles.stickyBar}>
            <div className={styles.stickyContent}>
              <div className={styles.stickyInfo}>
                <Typography variant="h4" as="p">
                  {event.name}
                </Typography>
                {minPrice && (
                  <PriceDisplay amount={minPrice} size="md" />
                )}
              </div>
              <Button
                variant="filled"
                size="lg"
                onClick={() => window.location.href = `/events/${event.slug}/tickets`}
              >
                <Ticket style={{ width: 20, height: 20 }} />
                GET TICKETS
              </Button>
            </div>
          </div>
        ) : undefined
      }
    />
  );
}
