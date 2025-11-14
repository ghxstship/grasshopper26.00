/**
 * LoadingSpinner - Loading indicator
 * GHXSTSHIP Design System
 */

'use client';

import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={`${styles.spinner} ${styles[size]} ${className || ''}`} role="status">
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
}
