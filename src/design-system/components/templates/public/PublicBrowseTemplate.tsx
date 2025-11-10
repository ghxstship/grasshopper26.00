/**
 * Public Browse Template
 * Standardized layout for public-facing browse/catalog pages
 * Used for: Events, Shop, Artists, News, Catalog browsing
 */

'use client';

import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { LoadingSpinner } from '@/design-system/components/atoms/loading';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './PublicBrowseTemplate.module.css';

export interface SortOption {
  value: string;
  label: string;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface PublicBrowseTemplateProps {
  // Header
  title: string;
  subtitle?: string;
  heroGradient?: boolean;
  
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  
  // Filters
  filters?: React.ReactNode;
  showFilters?: boolean;
  
  // Sort
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  
  // Content
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  emptyState?: EmptyStateProps;
  
  // Grid Layout
  gridColumns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  
  // Results
  showResultsCount?: boolean;
  totalCount?: number;
  
  // Loading
  loading?: boolean;
  loadingCount?: number;
  
  // Additional Actions
  headerAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PublicBrowseTemplate({
  title,
  subtitle,
  heroGradient = true,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showSearch = true,
  filters,
  showFilters: showFiltersInitial = false,
  sortOptions,
  sortValue,
  onSortChange,
  items,
  renderItem,
  emptyState,
  gridColumns = 3,
  gap = 'md',
  showResultsCount = true,
  totalCount,
  loading = false,
  loadingCount = 6,
  headerAction,
}: PublicBrowseTemplateProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(showFiltersInitial);

  const gridClass = cn(
    styles.grid,
    gridColumns === 2 && styles.gridCols2,
    gridColumns === 3 && styles.gridCols3,
    gridColumns === 4 && styles.gridCols4,
    gap === 'sm' && styles.gapSm,
    gap === 'md' && styles.gapMd,
    gap === 'lg' && styles.gapLg
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={cn(styles.header, heroGradient && styles.headerGradient)}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {headerAction && (
          <Button onClick={headerAction.onClick} className={styles.headerAction}>
            {headerAction.icon}
            {headerAction.label}
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      {(showSearch || filters || sortOptions) && (
        <Card className={styles.filterCard}>
          <CardContent className={styles.filterContent}>
            <div className={styles.searchRow}>
              {/* Search */}
              {showSearch && (
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              )}

              {/* Filter Toggle */}
              {filters && (
                <Button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  variant="outline"
                  className={styles.filterToggle}
                >
                  <SlidersHorizontal className={styles.icon} />
                  Filters
                </Button>
              )}

              {/* Sort Dropdown */}
              {sortOptions && sortOptions.length > 0 && (
                <div className={styles.sortWrapper}>
                  <label htmlFor="sort-select" className={styles.sortLabel}>
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortValue}
                    onChange={(e) => onSortChange?.(e.target.value)}
                    className={styles.sortSelect}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Expanded Filters */}
            {filters && filtersExpanded && (
              <div className={styles.expandedFilters}>{filters}</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {showResultsCount && !loading && (
        <div className={styles.resultsCount}>
          Showing {items.length}
          {totalCount !== undefined && totalCount !== items.length && ` of ${totalCount}`} results
        </div>
      )}

      {/* Content Area */}
      <div className={styles.contentContainer}>
        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: loadingCount }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonText} />
                  <div className={styles.skeletonText} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 && emptyState ? (
          <div className={styles.emptyState}>
            {emptyState.icon && (
              <div className={styles.emptyIcon}>{emptyState.icon}</div>
            )}
            <h3 className={styles.emptyTitle}>{emptyState.title}</h3>
            {emptyState.description && (
              <p className={styles.emptyDescription}>{emptyState.description}</p>
            )}
            {emptyState.action && (
              <Button onClick={emptyState.action.onClick} className={styles.emptyAction}>
                {emptyState.action.label}
              </Button>
            )}
          </div>
        ) : (
          <div className={gridClass}>
            {items.map((item, index) => (
              <div key={item.id || index}>{renderItem(item, index)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
