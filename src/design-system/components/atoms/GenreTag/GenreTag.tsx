/**
 * GenreTag Component
 * GHXSTSHIP Entertainment Platform - Music genre tags
 * SHARE TECH MONO uppercase tags
 */

import * as React from 'react';
import styles from './GenreTag.module.css';

export type GenreTagVariant = 'default' | 'outlined' | 'filled';
export type GenreTagSize = 'sm' | 'md';

export interface GenreTagProps {
  genre: string;
  variant?: GenreTagVariant;
  size?: GenreTagSize;
  onClick?: () => void;
  className?: string;
}

export const GenreTag = React.forwardRef<HTMLSpanElement, GenreTagProps>(
  (
    {
      genre,
      variant = 'default',
      size = 'sm',
      onClick,
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.tag,
      styles[variant],
      styles[size],
      onClick && styles.clickable,
      className,
    ].filter(Boolean).join(' ');

    const Component = onClick ? 'button' : 'span';

    return (
      <Component
        ref={ref as any}
        className={classNames}
        onClick={onClick}
        type={onClick ? 'button' : undefined}
      >
        {genre}
      </Component>
    );
  }
);

GenreTag.displayName = 'GenreTag';
