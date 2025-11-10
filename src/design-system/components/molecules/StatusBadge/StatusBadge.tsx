/**
 * StatusBadge Component
 * GHXSTSHIP Entertainment Platform - Status Badge
 * Geometric containers for status indicators (SOLD OUT, ON SALE, etc.)
 */

import * as React from 'react';
import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
  status: 'sold-out' | 'on-sale' | 'coming-soon' | 'live' | 'ended';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const defaultLabels: Record<StatusBadgeProps['status'], string> = {
  'sold-out': 'SOLD OUT',
  'on-sale': 'ON SALE',
  'coming-soon': 'COMING SOON',
  'live': 'LIVE NOW',
  'ended': 'ENDED',
};

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, label, size = 'md', className = '' }, ref) => {
    const displayLabel = label || defaultLabels[status];

    const classNames = [
      styles.badge,
      styles[status],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        <span className={styles.label}>{displayLabel}</span>
      </div>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
