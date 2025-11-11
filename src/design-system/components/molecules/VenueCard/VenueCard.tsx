'use client';

import React from 'react';
import Link from 'next/link';
import styles from './VenueCard.module.css';
import { VenueCapacityIndicator } from '../../atoms/VenueCapacityIndicator';
import type { Venue } from '@/types/super-expansion';

export interface VenueCardProps {
  venue: Venue;
  href?: string;
  showCapacity?: boolean;
  className?: string;
}

export const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  href,
  showCapacity = true,
  className,
}) => {
  const content = (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.name}>{venue.venue_name}</h3>
        {venue.venue_type && (
          <span className={styles.type}>
            {venue.venue_type.replace('_', ' ').toUpperCase()}
          </span>
        )}
      </div>

      <div className={styles.location}>
        {venue.city}, {venue.state || 'N/A'}
      </div>

      {showCapacity && (
        <div className={styles.capacity}>
          <VenueCapacityIndicator capacity={venue.max_capacity} />
        </div>
      )}

      <div className={styles.meta}>
        {venue.primary_email && (
          <span className={styles.metaItem}>{venue.primary_email}</span>
        )}
        {venue.primary_phone && (
          <span className={styles.metaItem}>{venue.primary_phone}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
};

VenueCard.displayName = 'VenueCard';
