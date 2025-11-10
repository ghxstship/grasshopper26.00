/**
 * NotificationBadge Component
 * GHXSTSHIP Entertainment Platform - Notification Badge
 * Geometric badge with count indicator
 */

import * as React from 'react';
import styles from './NotificationBadge.module.css';

export interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'dot' | 'count';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

export const NotificationBadge = React.forwardRef<HTMLDivElement, NotificationBadgeProps>(
  (
    {
      count,
      max = 99,
      variant = 'count',
      position = 'top-right',
      size = 'md',
      children,
      className = '',
    },
    ref
  ) => {
    const displayCount = count > max ? `${max}+` : count.toString();
    const showBadge = count > 0;

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const badgeClassNames = [
      styles.badge,
      styles[variant],
      styles[position],
      styles[size],
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        {children}
        {showBadge && (
          <span className={badgeClassNames} aria-label={`${count} notifications`}>
            {variant === 'count' && displayCount}
          </span>
        )}
      </div>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';
