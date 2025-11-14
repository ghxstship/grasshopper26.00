/**
 * PublicBrowseTemplate
 * GHXSTSHIP Design System
 * Template for browsing catalogs/listings with search and filters
 */

import React from 'react';
import { PageTemplate } from '../PageTemplate';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import { Loader2 } from 'lucide-react';
import styles from './PublicBrowseTemplate.module.css';

export interface PublicBrowseTemplateProps<T> {
  title: string;
  subtitle?: string;
  heroGradient?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  sortOptions?: Array<{ value: string; label: string }>;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  gridColumns?: number;
  gap?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
}

export function PublicBrowseTemplate<T>({
  title,
  subtitle,
  heroGradient = false,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  showSearch = false,
  sortOptions,
  sortValue,
  onSortChange,
  items,
  renderItem,
  gridColumns = 3,
  gap = 'md',
  loading = false,
  emptyState,
}: PublicBrowseTemplateProps<T>) {
  const gridClass = gridColumns === 2 ? styles.grid2 : gridColumns === 4 ? styles.grid4 : styles.grid3;
  const gapClass = gap === 'sm' ? styles.gapSm : gap === 'lg' ? styles.gapLg : styles.gapMd;

  return (
    <PageTemplate showHeader showFooter>
      <div className={`${styles.hero} ${heroGradient ? styles.heroGradient : ''}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.container}>
        {(showSearch || sortOptions) && (
          <div className={styles.controls}>
            {showSearch && onSearchChange && (
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className={styles.searchInput}
              />
            )}
            {sortOptions && onSortChange && (
              <Select
                value={sortValue}
                onChange={(e) => onSortChange(e.target.value)}
                options={sortOptions}
                className={styles.sortSelect}
              />
            )}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spinner} />
            <p className={styles.loadingText}>Loading...</p>
          </div>
        ) : items.length === 0 ? (
          emptyState && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>{emptyState.icon}</div>
              <h2 className={styles.emptyTitle}>{emptyState.title}</h2>
              <p className={styles.emptyDescription}>{emptyState.description}</p>
            </div>
          )
        ) : (
          <div className={`${styles.grid} ${gridClass} ${gapClass}`}>
            {items.map((item, index) => (
              <div key={index}>{renderItem(item)}</div>
            ))}
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
