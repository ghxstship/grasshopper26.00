/**
 * NotificationDot Component
 * GHXSTSHIP Entertainment Platform - Notification indicator
 * Geometric dot for unread notifications
 */

import * as React from 'react';
import styles from './NotificationDot.module.css';

export type NotificationDotSize = 'sm' | 'md' | 'lg';
export type NotificationDotVariant = 'default' | 'pulse';

export interface NotificationDotProps {
  count?: number;
  size?: NotificationDotSize;
  variant?: NotificationDotVariant;
  className?: string;
}

export const NotificationDot = React.forwardRef<HTMLSpanElement, NotificationDotProps>(
  (
    {
      count,
      size = 'md',
      variant = 'default',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.dot,
      styles[size],
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    const displayCount = count && count > 99 ? '99+' : count;

    return (
      <span ref={ref} className={classNames} aria-label={count ? `${count} notifications` : 'New notification'}>
        {count && <span className={styles.count}>{displayCount}</span>}
      </span>
    );
  }
);

NotificationDot.displayName = 'NotificationDot';
