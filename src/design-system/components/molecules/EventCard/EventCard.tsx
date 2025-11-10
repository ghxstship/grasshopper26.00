/**
 * EventCard Component
 * GHXSTSHIP Entertainment Platform - Event Display Card
 * Thick borders, hard geometric shadows, B&W imagery with halftone overlay
 */

import * as React from 'react';
import Image from 'next/image';
import styles from './EventCard.module.css';

export interface EventCardProps {
  event: {
    id: string;
    name: string;
    date: string;
    venue: string;
    imageUrl: string;
    status: 'on-sale' | 'sold-out' | 'coming-soon';
  };
  onClick?: () => void;
  className?: string;
}

export const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  ({ event, onClick, className = '' }, ref) => {
    const classNames = [
      styles.card,
      className,
    ].filter(Boolean).join(' ');

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        className={classNames}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `View ${event.name} event details` : undefined}
      >
        {/* B&W Image with halftone overlay */}
        <div className={styles.imageContainer}>
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className={styles.halftoneOverlay} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.title}>
            {event.name}
          </h3>
          
          <p className={styles.metadata}>
            {event.date} {event.venue}
          </p>

          {/* Status badge */}
          {event.status === 'sold-out' && (
            <div className={styles.statusBadge}>
              <span className={styles.statusText}>
                SOLD OUT
              </span>
            </div>
          )}

          {event.status === 'on-sale' && (
            <div className={`${styles.statusBadge} ${styles.statusOnSale}`}>
              <span className={styles.statusText}>
                ON SALE
              </span>
            </div>
          )}

          {event.status === 'coming-soon' && (
            <div className={`${styles.statusBadge} ${styles.statusComingSoon}`}>
              <span className={styles.statusText}>
                COMING SOON
              </span>
            </div>
          )}
        </div>

        {/* Geometric accent */}
        <div className={styles.geometricAccent} aria-hidden="true" />
      </div>
    );
  }
);

EventCard.displayName = 'EventCard';
