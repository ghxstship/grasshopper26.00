/**
 * LineupSection Component
 * GHXSTSHIP Entertainment Platform - Event Lineup Display
 * Filterable artist lineup with genre/stage filters
 */

'use client';

import * as React from 'react';
import { ArtistCard, ArtistCardProps } from '../../molecules/ArtistCard';
import { FilterBar, FilterOption } from '../../molecules/FilterBar';
import styles from './LineupSection.module.css';

export interface LineupSectionProps {
  artists: ArtistCardProps['artist'][];
  onArtistClick?: (artistId: string) => void;
  filters?: FilterOption[];
  selectedFilters?: string[];
  onFilterChange?: (filterId: string) => void;
  title?: string;
  variant?: 'circle' | 'square';
  className?: string;
}

export const LineupSection = React.forwardRef<HTMLDivElement, LineupSectionProps>(
  (
    {
      artists,
      onArtistClick,
      filters,
      selectedFilters = [],
      onFilterChange,
      title = 'LINEUP',
      variant = 'circle',
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
        <h2 className={styles.title}>{title}</h2>

        {filters && filters.length > 0 && onFilterChange && (
          <FilterBar
            filters={filters}
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
            label="FILTER BY"
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
            <p className={styles.emptyText}>NO ARTISTS MATCH YOUR FILTERS</p>
          </div>
        )}
      </div>
    );
  }
);

LineupSection.displayName = 'LineupSection';
