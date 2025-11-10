/**
 * DateDisplay Component
 * GHXSTSHIP Entertainment Platform - Event date display
 * BEBAS NEUE date with SHARE TECH MONO time
 */

import * as React from 'react';
import styles from './DateDisplay.module.css';

export type DateFormat = 'full' | 'short' | 'numeric';
export type DateSize = 'sm' | 'md' | 'lg';

export interface DateDisplayProps {
  date: Date | string;
  format?: DateFormat;
  size?: DateSize;
  showTime?: boolean;
  showDay?: boolean;
  className?: string;
}

export const DateDisplay = React.forwardRef<HTMLDivElement, DateDisplayProps>(
  (
    {
      date,
      format = 'full',
      size = 'md',
      showTime = false,
      showDay = true,
      className = '',
    },
    ref
  ) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const formatDate = () => {
      const options: Intl.DateTimeFormatOptions = {
        month: format === 'numeric' ? '2-digit' : format === 'short' ? 'short' : 'long',
        day: '2-digit',
        year: 'numeric',
      };

      if (showDay) {
        options.weekday = format === 'short' ? 'short' : 'long';
      }

      return new Intl.DateTimeFormat('en-US', options).format(dateObj);
    };

    const formatTime = () => {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(dateObj);
    };

    const containerClassNames = [
      styles.container,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        <span className={styles.date}>{formatDate()}</span>
        {showTime && (
          <span className={styles.time}>{formatTime()}</span>
        )}
      </div>
    );
  }
);

DateDisplay.displayName = 'DateDisplay';
