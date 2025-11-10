'use client';

import { Calendar, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './upcoming-events.module.css';

interface UpcomingEventsProps {
  tickets: any[];
}

export function UpcomingEvents({ tickets }: UpcomingEventsProps) {
  return (
    <div className={styles.grid}>
      {tickets.map((ticket) => {
        const event = ticket.events;
        const eventDate = new Date(event.start_date);
        
        return (
          <Link
            key={ticket.id}
            href={`/events/${event.slug}`}
            className={styles.eventCard}
          >
            {event.hero_image_url && (
              <div className={styles.eventImage}>
                <Image
                  src={event.hero_image_url}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className={styles.eventContent}>
              <h3 className={styles.eventTitle}>
                {event.name}
              </h3>
              <div className={styles.eventMeta}>
                <div className={styles.metaItem}>
                  <Calendar className={styles.metaIcon} />
                  <span className={styles.metaText}>
                    {eventDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {event.venue_name && (
                  <div className={styles.metaItem}>
                    <MapPin className={styles.metaIcon} />
                    <span className={styles.metaTextTruncate}>
                      {event.venue_name}
                    </span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <Ticket className={styles.metaIcon} />
                  <span className={styles.metaTextSmall}>
                    Ticket #{ticket.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className={styles.eventFooter}>
                <span className={styles.statusText}>
                  {ticket.status === 'active' ? '✓ Active' : ticket.status}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
