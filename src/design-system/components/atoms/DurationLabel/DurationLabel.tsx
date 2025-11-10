/**
 * DurationLabel Component
 * GHXSTSHIP Entertainment Platform - Event duration display
 * SHARE TECH MONO duration formatting
 */

import * as React from 'react';
import styles from './DurationLabel.module.css';

export type DurationLabelSize = 'sm' | 'md' | 'lg';

export interface DurationLabelProps {
  minutes: number;
  size?: DurationLabelSize;
  showIcon?: boolean;
  className?: string;
}

export const DurationLabel = React.forwardRef<HTMLSpanElement, DurationLabelProps>(
  (
    {
      minutes,
      size = 'md',
      showIcon = false,
      className = '',
    },
    ref
  ) => {
    const formatDuration = () => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      if (hours > 0) {
        return mins > 0 ? `${hours}H ${mins}M` : `${hours}H`;
      }
      return `${mins}M`;
    };

    const classNames = [
      styles.duration,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classNames}>
        {showIcon && (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        )}
        {formatDuration()}
      </span>
    );
  }
);

DurationLabel.displayName = 'DurationLabel';
