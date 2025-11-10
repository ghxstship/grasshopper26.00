'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import styles from './event-card.module.css';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    slug: string;
    start_date: string;
    venue_name: string;
    hero_image_url?: string;
    ticket_types?: Array<{
      price: string;
      quantity_available: number;
      quantity_sold: number;
    }>;
  };
}

export function EventCard({ event }: EventCardProps) {
  const minPrice = event.ticket_types && event.ticket_types.length > 0
    ? Math.min(...event.ticket_types.map(tt => parseFloat(tt.price)))
    : null;

  const isSoldOut = event.ticket_types?.every(
    tt => tt.quantity_sold >= tt.quantity_available
  ) || false;

  return (
    <Link href={`/events/${event.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {event.hero_image_url ? (
          <Image
            src={event.hero_image_url}
            alt={event.name}
            fill
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        {isSoldOut && (
          <div className={styles.soldOutBadge}>
            <span>SOLD OUT</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{event.name}</h3>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <Calendar className={styles.metaIcon} />
            <span>{format(new Date(event.start_date), 'PPP')}</span>
          </div>
          <div className={styles.metaItem}>
            <MapPin className={styles.metaIcon} />
            <span>{event.venue_name}</span>
          </div>
        </div>

        {minPrice !== null && (
          <div className={styles.price}>
            From ${minPrice.toFixed(2)}
          </div>
        )}
      </div>
    </Link>
  );
}
