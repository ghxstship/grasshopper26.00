/**
 * TimeLabel Component
 * GHXSTSHIP Entertainment Platform - Time display
 * SHARE TECH MONO time formatting
 */

import * as React from 'react';
import styles from './TimeLabel.module.css';

export type TimeLabelFormat = '12h' | '24h';
export type TimeLabelSize = 'sm' | 'md' | 'lg';

export interface TimeLabelProps {
  time: Date | string;
  format?: TimeLabelFormat;
  size?: TimeLabelSize;
  showSeconds?: boolean;
  className?: string;
}

export const TimeLabel = React.forwardRef<HTMLSpanElement, TimeLabelProps>(
  (
    {
      time,
      format = '12h',
      size = 'md',
      showSeconds = false,
      className = '',
    },
    ref
  ) => {
    const timeObj = typeof time === 'string' ? new Date(time) : time;

    const formatTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: format === '12h',
      };

      if (showSeconds) {
        options.second = '2-digit';
      }

      return new Intl.DateTimeFormat('en-US', options).format(timeObj);
    };

    const classNames = [
      styles.time,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classNames}>
        {formatTime()}
      </span>
    );
  }
);

TimeLabel.displayName = 'TimeLabel';
