/**
 * ArtistName Component
 * GHXSTSHIP Entertainment Platform - Artist/performer display
 * BEBAS NEUE artist names with optional headliner badge
 */

import * as React from 'react';
import styles from './ArtistName.module.css';

export type ArtistNameSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ArtistNameProps {
  name: string;
  isHeadliner?: boolean;
  size?: ArtistNameSize;
  className?: string;
}

export const ArtistName = React.forwardRef<HTMLSpanElement, ArtistNameProps>(
  (
    {
      name,
      isHeadliner = false,
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.name,
      styles[size],
      isHeadliner && styles.headliner,
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classNames}>
        {name}
      </span>
    );
  }
);

ArtistName.displayName = 'ArtistName';
