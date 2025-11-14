/**
 * EventCard - Event display molecule
 * GHXSTSHIP Atomic Design System
 */

import Image from 'next/image';
import Link from 'next/link';
import { Card, Stack, Heading, Text, Button } from '../../atoms';
import styles from './EventCard.module.css';

export interface EventCardProps {
  /** Event title */
  title?: string;
  /** Event date */
  date?: string;
  /** Event location */
  location?: string;
  /** Event image */
  image?: string;
  /** Event slug/link */
  slug?: string;
  /** Price */
  price?: string;
  /** Sold out */
  soldOut?: boolean;
  /** Event object (alternative interface for tests) */
  event?: {
    id: string;
    name: string;
    date: string;
    venue: string;
    imageUrl?: string;
    status?: string;
  };
  /** Click handler */
  onClick?: () => void;
}

export function EventCard({
  title,
  date,
  location,
  image,
  slug,
  price,
  soldOut,
  event,
  onClick,
}: EventCardProps) {
  // Support both prop patterns
  const eventTitle = title || event?.name || '';
  const eventDate = date || event?.date || '';
  const eventLocation = location || event?.venue || '';
  const eventImage = image || event?.imageUrl;
  const eventSlug = slug || event?.id || '';
  const isSoldOut = soldOut || event?.status === 'sold-out';
  
  const cardContent = (
    <>
      {/* Image */}
      {eventImage && (
        <div className={styles.imageContainer}>
          <Image
            src={eventImage}
            alt={eventTitle}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isSoldOut && (
            <div className={styles.soldOutBadge}>
              <Text font="bebas" size="lg" color="inverse" uppercase>
                Sold Out
              </Text>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <Stack gap={3} className={styles.content}>
        <Heading level={3} font="bebas">
          {eventTitle}
        </Heading>

        <Stack gap={2}>
          <Text font="share-mono" size="sm" color="secondary">
            {eventDate}
          </Text>
          <Text font="share" size="sm" color="secondary">
            {eventLocation}
          </Text>
        </Stack>

        {price && (
          <Text font="bebas" size="xl" weight="bold">
            {price}
          </Text>
        )}

        <Button variant={isSoldOut ? 'secondary' : 'primary'} fullWidth disabled={isSoldOut}>
          {isSoldOut ? 'Sold Out' : 'Get Tickets'}
        </Button>
      </Stack>
    </>
  );

  return (
    <Card variant="elevated" padding={0} interactive onClick={onClick}>
      {eventSlug && !onClick ? (
        <Link href={`/events/${eventSlug}`} className={styles.link}>
          {cardContent}
        </Link>
      ) : (
        <div className={styles.link}>
          {cardContent}
        </div>
      )}
    </Card>
  );
}
