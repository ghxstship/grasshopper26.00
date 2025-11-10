/**
 * FilterBar Component
 * GHXSTSHIP Entertainment Platform - Filter Controls
 * BEBAS NEUE labels with geometric filter buttons
 */

import * as React from 'react';
import styles from './FilterBar.module.css';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterBarProps {
  filters: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (filterId: string) => void;
  label?: string;
  multiSelect?: boolean;
  className?: string;
}

export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  ({ filters, selectedFilters, onFilterChange, label, multiSelect = true, className = '' }, ref) => {
    const handleFilterClick = (filterId: string) => {
      onFilterChange(filterId);
    };

    const handleKeyDown = (e: React.KeyboardEvent, filterId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onFilterChange(filterId);
      }
    };

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames} role="group" aria-label={label || 'Filters'}>
        {label && (
          <div className={styles.label}>{label}</div>
        )}
        
        <div className={styles.filters}>
          {filters.map((filter) => {
            const isSelected = selectedFilters.includes(filter.id);
            
            const filterClassNames = [
              styles.filter,
              isSelected && styles.selected,
            ].filter(Boolean).join(' ');

            return (
              <button
                key={filter.id}
                className={filterClassNames}
                onClick={() => handleFilterClick(filter.id)}
                onKeyDown={(e) => handleKeyDown(e, filter.id)}
                role={multiSelect ? 'checkbox' : 'radio'}
                aria-checked={isSelected}
                type="button"
              >
                <span className={styles.filterLabel}>{filter.label}</span>
                {filter.count !== undefined && (
                  <span className={styles.count}>{filter.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

FilterBar.displayName = 'FilterBar';
