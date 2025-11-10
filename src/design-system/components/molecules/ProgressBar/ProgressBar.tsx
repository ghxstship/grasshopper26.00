/**
 * ProgressBar Component
 * GHXSTSHIP Entertainment Platform - Progress Indicator
 * Hard geometric progress bar with percentage display
 */

import * as React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'striped';
  className?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      label,
      showPercentage = true,
      size = 'md',
      variant = 'default',
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
      styles[size],
      styles[variant],
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        {(label || showPercentage) && (
          <div className={styles.header}>
            {label && <span className={styles.label}>{label}</span>}
            {showPercentage && (
              <span className={styles.percentage}>{Math.round(percentage)}%</span>
            )}
          </div>
        )}

        <div className={barClassNames} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
          <div
            className={styles.fill}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
