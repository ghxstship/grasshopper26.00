/**
 * DateTimeDisplay Component
 * GHXSTSHIP Entertainment Platform - Date/Time Display
 * SHARE TECH MONO for metadata with geometric separators
 */

import * as React from 'react';
import styles from './DateTimeDisplay.module.css';

export interface DateTimeDisplayProps {
  date: string | Date;
  showTime?: boolean;
  format?: 'short' | 'long';
  separator?: string;
  className?: string;
}

export const DateTimeDisplay = React.forwardRef<HTMLDivElement, DateTimeDisplayProps>(
  ({ date, showTime = false, format = 'short', separator = '//', className = '' }, ref) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const formatDate = () => {
      if (format === 'long') {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        };
        return dateObj.toLocaleDateString('en-US', options).toUpperCase();
      }
      
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${month}.${day}.${year}`;
    };

    const formatTime = () => {
      const hours = dateObj.getHours();
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    };

    const classNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        <time dateTime={dateObj.toISOString()} className={styles.datetime}>
          <span className={styles.date}>{formatDate()}</span>
          {showTime && (
            <>
              <span className={styles.separator} aria-hidden="true">
                {separator}
              </span>
              <span className={styles.time}>{formatTime()}</span>
            </>
          )}
        </time>
      </div>
    );
  }
);

DateTimeDisplay.displayName = 'DateTimeDisplay';
