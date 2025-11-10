/**
 * Grid Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Filterable grid for events, artists, products
 */

import * as React from "react";
import styles from './GridLayout.module.css';

export interface GridLayoutProps {
  /** Header/navigation */
  header?: React.ReactNode;
  
  /** Page title */
  title?: string;
  
  /** Page description */
  description?: string;
  
  /** Filter sidebar */
  filters?: React.ReactNode;
  
  /** Search bar */
  search?: React.ReactNode;
  
  /** Sort controls */
  sort?: React.ReactNode;
  
  /** View toggle (grid/list) */
  viewToggle?: React.ReactNode;
  
  /** Grid items */
  children: React.ReactNode;
  
  /** Pagination */
  pagination?: React.ReactNode;
  
  /** Footer */
  footer?: React.ReactNode;
  
  /** Show filters on mobile */
  filtersOpen?: boolean;
  
  /** Toggle filters */
  onToggleFilters?: () => void;
  
  /** Grid columns */
  columns?: 2 | 3 | 4;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  header,
  title,
  description,
  filters,
  search,
  sort,
  viewToggle,
  children,
  pagination,
  footer,
  filtersOpen = false,
  onToggleFilters,
  columns = 3,
}) => {
  return (
    <div className={styles.layout}>
      {/* Header */}
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}
      
      {/* Page Header */}
      {(title || description) && (
        <div className={styles.pageHeader}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
      
      {/* Main Container */}
      <div className={styles.container}>
        {/* Filters Sidebar */}
        {filters && (
          <>
            <aside 
              className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ''}`}
              aria-label="Filters"
            >
              {filters}
            </aside>
            
            {filtersOpen && (
              <div 
                className={styles.overlay}
                onClick={onToggleFilters}
                aria-hidden="true"
              />
            )}
          </>
        )}
        
        {/* Content Area */}
        <div className={styles.content}>
          {/* Toolbar */}
          {(search || sort || viewToggle) && (
            <div className={styles.toolbar}>
              {search && (
                <div className={styles.search}>
                  {search}
                </div>
              )}
              
              <div className={styles.toolbarActions}>
                {sort}
                {viewToggle}
              </div>
            </div>
          )}
          
          {/* Grid */}
          <div 
            className={styles.grid}
            data-columns={columns}
            role="list"
          >
            {children}
          </div>
          
          {/* Pagination */}
          {pagination && (
            <div className={styles.pagination}>
              {pagination}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      {footer && (
        <footer className={styles.footer} role="contentinfo">
          {footer}
        </footer>
      )}
    </div>
  );
};
