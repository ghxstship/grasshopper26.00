/**
 * VenueInfo Component
 * GHXSTSHIP Entertainment Platform - Venue Information Display
 * SHARE TECH MONO for venue details with geometric layout
 */

import * as React from 'react';
import styles from './VenueInfo.module.css';

export interface VenueInfoProps {
  venue: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    capacity?: number;
    ageRestriction?: string;
  };
  showCapacity?: boolean;
  showAgeRestriction?: boolean;
  variant?: 'compact' | 'full';
  className?: string;
}

export const VenueInfo = React.forwardRef<HTMLDivElement, VenueInfoProps>(
  (
    {
      venue,
      showCapacity = true,
      showAgeRestriction = true,
      variant = 'full',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.container,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    const formatCapacity = (capacity: number) => {
      return new Intl.NumberFormat('en-US').format(capacity);
    };

    return (
      <div ref={ref} className={classNames}>
        <div className={styles.venueName}>{venue.name}</div>

        {variant === 'full' && (
          <>
            {venue.address && (
              <div className={styles.address}>
                <span className={styles.addressLine}>{venue.address}</span>
                {(venue.city || venue.state || venue.zipCode) && (
                  <span className={styles.addressLine}>
                    {[venue.city, venue.state, venue.zipCode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                )}
              </div>
            )}

            <div className={styles.details}>
              {showCapacity && venue.capacity && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>CAPACITY</span>
                  <span className={styles.detailValue}>
                    {formatCapacity(venue.capacity)}
                  </span>
                </div>
              )}

              {showAgeRestriction && venue.ageRestriction && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>AGE</span>
                  <span className={styles.detailValue}>{venue.ageRestriction}</span>
                </div>
              )}
            </div>
          </>
        )}

        {variant === 'compact' && (venue.city || venue.state) && (
          <div className={styles.location}>
            {[venue.city, venue.state].filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    );
  }
);

VenueInfo.displayName = 'VenueInfo';
