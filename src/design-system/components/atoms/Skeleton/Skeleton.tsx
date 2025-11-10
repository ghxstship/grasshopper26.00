/**
 * Skeleton Component
 * GHXSTSHIP Entertainment Platform - Geometric loading placeholders
 * Hard-edge geometric shapes for loading states
 */

import * as React from 'react';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'rectangular' | 'circular';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      animation = 'pulse',
      width,
      height,
      className = '',
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.skeleton,
      styles[variant],
      styles[animation],
      className,
    ].filter(Boolean).join(' ');

    const style: React.CSSProperties = {
      width,
      height,
    };

    return (
      <div
        ref={ref}
        className={classNames}
        style={style}
        aria-busy="true"
        aria-live="polite"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
