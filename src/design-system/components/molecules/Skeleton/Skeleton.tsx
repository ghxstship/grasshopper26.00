/**
 * Skeleton Component
 * GHXSTSHIP Entertainment Platform - Loading Skeleton
 * Geometric loading placeholders
 */

import * as React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width, height, count = 1, className = '' }, ref) => {
    const classNames = [
      styles.skeleton,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    const style: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };

    if (count === 1) {
      return <div ref={ref} className={classNames} style={style} aria-busy="true" aria-live="polite" />;
    }

    return (
      <div ref={ref} className={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={classNames} style={style} aria-busy="true" aria-live="polite" />
        ))}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';
