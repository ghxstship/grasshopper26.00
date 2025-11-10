/**
 * CalendarButton Component
 * GHXSTSHIP Entertainment Platform - Add to calendar button
 * Geometric button for calendar integration
 */

import * as React from 'react';
import styles from './CalendarButton.module.css';

export type CalendarButtonSize = 'sm' | 'md' | 'lg';
export type CalendarButtonVariant = 'default' | 'icon-only';

export interface CalendarButtonProps {
  eventTitle: string;
  startDate: Date | string;
  endDate?: Date | string;
  location?: string;
  description?: string;
  size?: CalendarButtonSize;
  variant?: CalendarButtonVariant;
  onClick?: () => void;
  className?: string;
}

export const CalendarButton = React.forwardRef<HTMLButtonElement, CalendarButtonProps>(
  (
    {
      eventTitle,
      startDate,
      endDate,
      location,
      description,
      size = 'md',
      variant = 'default',
      onClick,
      className = '',
    },
    ref
  ) => {
    const handleClick = () => {
      // Generate .ics file content
      const start = new Date(startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = endDate ? new Date(endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : start;
      
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${eventTitle}`,
        location ? `LOCATION:${location}` : '',
        description ? `DESCRIPTION:${description}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
      ].filter(Boolean).join('\n');

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventTitle.replace(/\s+/g, '_')}.ics`;
      link.click();
      URL.revokeObjectURL(url);
      
      onClick?.();
    };

    const classNames = [
      styles.button,
      styles[size],
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type="button"
        className={classNames}
        onClick={handleClick}
        aria-label="Add to calendar"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {variant === 'default' && (
          <span className={styles.label}>ADD TO CALENDAR</span>
        )}
      </button>
    );
  }
);

CalendarButton.displayName = 'CalendarButton';
