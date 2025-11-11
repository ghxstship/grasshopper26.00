'use client';

import React from 'react';
import styles from './VenueCapacityIndicator.module.css';

export interface VenueCapacityIndicatorProps {
  capacity: number;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export const VenueCapacityIndicator: React.FC<VenueCapacityIndicatorProps> = ({
  capacity,
  label = 'CAPACITY',
  showIcon = true,
  className,
}) => {
  const formatCapacity = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {showIcon && (
        <div className={styles.icon}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="4" height="4" fill="currentColor" />
            <rect x="10" y="2" width="4" height="4" fill="currentColor" />
            <rect x="6" y="10" width="4" height="4" fill="currentColor" />
          </svg>
        </div>
      )}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.capacity}>{formatCapacity(capacity)}</span>
      </div>
    </div>
  );
};

VenueCapacityIndicator.displayName = 'VenueCapacityIndicator';
