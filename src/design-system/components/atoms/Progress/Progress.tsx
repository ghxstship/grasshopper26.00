/**
 * Progress Component
 * GHXSTSHIP Entertainment Platform - Progress indicators
 * Geometric progress bars with hard edges
 */

import * as React from 'react';
import styles from './Progress.module.css';

export type ProgressVariant = 'default' | 'striped';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'default',
      size = 'md',
      label,
      showValue = false,
      className = '',
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const barClassNames = [
      styles.bar,
      styles[variant],
      styles[size],
    ].filter(Boolean).join(' ');

    const fillClassNames = [
      styles.fill,
      styles[variant],
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        {(label || showValue) && (
          <div className={styles.header}>
            {label && <span className={styles.label}>{label}</span>}
            {showValue && (
              <span className={styles.value}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div
          className={barClassNames}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <div
            className={fillClassNames}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';
