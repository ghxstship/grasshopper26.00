/**
 * EventsGrid Component
 * GHXSTSHIP Entertainment Platform - Asymmetric event grid layout
 * Bold geometric framing, high-contrast cards, filter system
 */

'use client';

import * as React from 'react';
import { EventCard, EventCardProps } from '../../molecules/EventCard';
import styles from './EventsGrid.module.css';

export interface EventsGridProps {
  events: EventCardProps['event'][];
  onEventClick?: (eventId: string) => void;
  filters?: {
    label: string;
    value: string;
    active?: boolean;
  }[];
  onFilterChange?: (filterValue: string) => void;
  layout?: 'grid' | 'asymmetric';
  className?: string;
}

export const EventsGrid = React.forwardRef<HTMLDivElement, EventsGridProps>(
  (
    {
      events,
      onEventClick,
      filters,
      onFilterChange,
      layout = 'asymmetric',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.eventsGrid,
      className,
    ].filter(Boolean).join(' ');

    const gridClassNames = [
      styles.grid,
      styles[layout],
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        {filters && filters.length > 0 && (
          <div className={styles.filters}>
            <div className={styles.filtersLabel}>FILTER BY:</div>
            <div className={styles.filterButtons}>
              {filters.map((filter, index) => (
                <button
                  key={index}
                  className={`${styles.filterButton} ${filter.active ? styles.filterButtonActive : ''}`}
                  onClick={() => onFilterChange?.(filter.value)}
                  aria-pressed={filter.active}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={gridClassNames}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick?.(event.id)}
            />
          ))}
        </div>

        {events.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>□</div>
            <p className={styles.emptyText}>No events found</p>
          </div>
        )}
      </div>
    );
  }
);

EventsGrid.displayName = 'EventsGrid';
