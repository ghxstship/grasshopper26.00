/**
 * CapacityIndicator Component
 * GHXSTSHIP Entertainment Platform - Event capacity indicator
 * Geometric bar showing remaining capacity
 */

import * as React from 'react';
import styles from './CapacityIndicator.module.css';

export type CapacityIndicatorSize = 'sm' | 'md' | 'lg';

export interface CapacityIndicatorProps {
  current: number;
  max: number;
  size?: CapacityIndicatorSize;
  showLabel?: boolean;
  showPercentage?: boolean;
  className?: string;
}

export const CapacityIndicator = React.forwardRef<HTMLDivElement, CapacityIndicatorProps>(
  (
    {
      current,
      max,
      size = 'md',
      showLabel = true,
      showPercentage = false,
      className = '',
    },
    ref
  ) => {
    const percentage = Math.min((current / max) * 100, 100);
    const remaining = Math.max(max - current, 0);

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const barClassNames = [
      styles.bar,
      styles[size],
      percentage >= 90 && styles.almostFull,
      percentage === 100 && styles.full,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        {showLabel && (
          <div className={styles.header}>
            <span className={styles.label}>
              {percentage === 100 ? 'SOLD OUT' : `${remaining} REMAINING`}
            </span>
            {showPercentage && (
              <span className={styles.percentage}>{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        
        <div className={barClassNames}>
          <div
            className={styles.fill}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`${current} of ${max} capacity filled`}
          />
        </div>
      </div>
    );
  }
);

CapacityIndicator.displayName = 'CapacityIndicator';
