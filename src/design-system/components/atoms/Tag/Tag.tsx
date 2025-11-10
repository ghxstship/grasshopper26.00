/**
 * Tag Component
 * GHXSTSHIP Entertainment Platform - Content tags
 * Simple geometric tags for categorization
 */

import * as React from 'react';
import styles from './Tag.module.css';

export type TagVariant = 'default' | 'outlined' | 'filled';
export type TagSize = 'sm' | 'md';

export interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      children,
      variant = 'default',
      size = 'sm',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.tag,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classNames}>
        {children}
      </span>
    );
  }
);

Tag.displayName = 'Tag';
