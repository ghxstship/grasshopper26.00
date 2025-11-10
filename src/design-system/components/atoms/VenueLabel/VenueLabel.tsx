/**
 * VenueLabel Component
 * GHXSTSHIP Entertainment Platform - Venue/location display
 * SHARE TECH MONO with location icon
 */

import * as React from 'react';
import styles from './VenueLabel.module.css';

export type VenueLabelSize = 'sm' | 'md' | 'lg';

export interface VenueLabelProps {
  venue: string;
  city?: string;
  state?: string;
  showIcon?: boolean;
  size?: VenueLabelSize;
  className?: string;
}

export const VenueLabel = React.forwardRef<HTMLDivElement, VenueLabelProps>(
  (
    {
      venue,
      city,
      state,
      showIcon = true,
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const containerClassNames = [
      styles.container,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    const location = [city, state].filter(Boolean).join(', ');

    return (
      <div ref={ref} className={containerClassNames}>
        {showIcon && (
          <span className={styles.icon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </span>
        )}
        <div className={styles.content}>
          <span className={styles.venue}>{venue}</span>
          {location && (
            <span className={styles.location}>{location}</span>
          )}
        </div>
      </div>
    );
  }
);

VenueLabel.displayName = 'VenueLabel';
