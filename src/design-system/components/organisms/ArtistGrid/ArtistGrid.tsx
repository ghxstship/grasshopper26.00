/**
 * ArtistGrid Component
 * GHXSTSHIP Entertainment Platform - Artist Directory Grid
 * Filterable artist grid with B&W photography
 */

'use client';

import * as React from 'react';
import { ArtistCard, ArtistCardProps } from '../../molecules/ArtistCard';
import { FilterBar, FilterOption } from '../../molecules/FilterBar/FilterBar';
import styles from './ArtistGrid.module.css';

export interface ArtistGridProps {
  artists: ArtistCardProps['artist'][];
  onArtistClick?: (artistId: string) => void;
  filters?: FilterOption[];
  selectedFilters?: string[];
  onFilterChange?: (filterId: string) => void;
  variant?: 'circle' | 'square';
  className?: string;
}

export const ArtistGrid = React.forwardRef<HTMLDivElement, ArtistGridProps>(
  (
    {
      artists,
      onArtistClick,
      filters,
      selectedFilters = [],
      onFilterChange,
      variant = 'square',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        {filters && filters.length > 0 && onFilterChange && (
          <FilterBar
            filters={filters}
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
            label="FILTER ARTISTS"
            className={styles.filterBar}
          />
        )}

        <div className={styles.grid}>
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              variant={variant}
              onClick={() => onArtistClick?.(artist.id)}
            />
          ))}
        </div>

        {artists.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>◉</div>
            <p className={styles.emptyText}>NO ARTISTS FOUND</p>
          </div>
        )}
      </div>
    );
  }
);

ArtistGrid.displayName = 'ArtistGrid';
