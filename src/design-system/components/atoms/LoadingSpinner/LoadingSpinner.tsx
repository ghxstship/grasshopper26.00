/**
 * LoadingSpinner Component
 * GHXSTSHIP Entertainment Platform - Geometric loading animation
 * NO circular spinners - use geometric shapes animation
 */

import * as React from 'react';
import styles from './LoadingSpinner.module.css';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';
export type LoadingSpinnerVariant = 'blocks' | 'bars' | 'pulse';

export interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  variant?: LoadingSpinnerVariant;
  className?: string;
  'aria-label'?: string;
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      size = 'md',
      variant = 'blocks',
      className = '',
      'aria-label': ariaLabel = 'Loading',
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.spinner,
      styles[size],
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classNames}
        role="status"
        aria-label={ariaLabel}
        {...props}
      >
        {variant === 'blocks' && (
          <>
            <div className={styles.block} aria-hidden="true" />
            <div className={styles.block} aria-hidden="true" />
            <div className={styles.block} aria-hidden="true" />
            <div className={styles.block} aria-hidden="true" />
          </>
        )}
        
        {variant === 'bars' && (
          <>
            <div className={styles.bar} aria-hidden="true" />
            <div className={styles.bar} aria-hidden="true" />
            <div className={styles.bar} aria-hidden="true" />
          </>
        )}
        
        {variant === 'pulse' && (
          <div className={styles.pulseShape} aria-hidden="true" />
        )}
        
        <span className={styles.srOnly}>{ariaLabel}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';
