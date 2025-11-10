/**
 * FavoriteButton Component
 * GHXSTSHIP Entertainment Platform - Favorite/bookmark toggle
 * Geometric heart icon with active state
 */

'use client';

import * as React from 'react';
import styles from './FavoriteButton.module.css';

export type FavoriteButtonSize = 'sm' | 'md' | 'lg';

export interface FavoriteButtonProps {
  isFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  size?: FavoriteButtonSize;
  label?: string;
  className?: string;
}

export const FavoriteButton = React.forwardRef<HTMLButtonElement, FavoriteButtonProps>(
  (
    {
      isFavorite = false,
      onToggle,
      size = 'md',
      label = 'Add to favorites',
      className = '',
    },
    ref
  ) => {
    const [active, setActive] = React.useState(isFavorite);

    React.useEffect(() => {
      setActive(isFavorite);
    }, [isFavorite]);

    const handleClick = () => {
      const newState = !active;
      setActive(newState);
      onToggle?.(newState);
    };

    const classNames = [
      styles.button,
      styles[size],
      active && styles.active,
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type="button"
        className={classNames}
        onClick={handleClick}
        aria-label={active ? 'Remove from favorites' : label}
        aria-pressed={active}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    );
  }
);

FavoriteButton.displayName = 'FavoriteButton';
