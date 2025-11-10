'use client';

import React from 'react';
import Image from 'next/image';
import styles from './SearchResults.module.css';

export interface SearchResultItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  meta?: string[];
  url: string;
}

export interface SearchResultsProps {
  /** Search query */
  query: string;
  /** Search results */
  results: SearchResultItem[];
  /** Total results count */
  totalCount: number;
  /** Sort options */
  sortOptions?: Array<{ value: string; label: string }>;
  /** Current sort value */
  currentSort?: string;
  /** Sort change handler */
  onSortChange?: (value: string) => void;
  /** Result click handler */
  onResultClick?: (result: SearchResultItem) => void;
  /** Additional CSS class */
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  totalCount,
  sortOptions,
  currentSort,
  onSortChange,
  onResultClick,
  className = '',
}) => {
  if (results.length === 0) {
    return (
      <div className={`${styles.results} ${className}`}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◯</div>
          <p className={styles.emptyText}>No results found for &quot;{query}&quot;</p>
          <p className={styles.emptySubtext}>Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.results} ${className}`}>
      <div className={styles.header}>
        <div className={styles.info}>
          {totalCount} RESULTS FOR <span className={styles.query}>&quot;{query}&quot;</span>
        </div>
        {sortOptions && sortOptions.length > 0 && (
          <select
            className={styles.sortSelect}
            value={currentSort}
            onChange={(e) => onSortChange?.(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.items}>
        {results.map((result) => (
          <div
            key={result.id}
            className={styles.result}
            onClick={() => onResultClick?.(result.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onResultClick?.(result.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {result.thumbnailUrl && (
              <div className={styles.thumbnail}>
                <Image
                  src={result.thumbnailUrl}
                  alt={result.title}
                  width={96}
                  height={96}
                  className={styles.thumbnailImage}
                />
              </div>
            )}
            <div className={styles.content}>
              <span className={styles.itemType}>{result.type}</span>
              <h3 className={styles.itemTitle}>{result.title}</h3>
              {result.description && (
                <p className={styles.itemDescription}>{result.description}</p>
              )}
              {result.meta && result.meta.length > 0 && (
                <div className={styles.itemMeta}>
                  {result.meta.map((item, index) => (
                    <span key={index}>{item}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

SearchResults.displayName = 'SearchResults';
