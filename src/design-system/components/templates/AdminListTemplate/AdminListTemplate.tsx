/**
 * Admin List Template
 * GHXSTSHIP Monochromatic Design System
 * Template for admin list/table pages with search, filters, and stats
 */

import * as React from "react";
import styles from './AdminListTemplate.module.css';

export interface AdminListTemplateProps {
  /** Sidebar navigation */
  sidebar?: React.ReactNode;
  
  /** Page title */
  title: string;
  
  /** Page subtitle */
  subtitle?: string;
  
  /** Page description */
  description?: string;
  
  /** Hero gradient background */
  heroGradient?: boolean;
  
  /** Breadcrumbs */
  breadcrumbs?: React.ReactNode;
  
  /** Tabs */
  tabs?: Array<{
    key: string;
    label: string;
  }>;
  
  /** Active tab key */
  activeTab?: string;
  
  /** Tab change handler */
  onTabChange?: (key: string) => void;
  
  /** Stats cards */
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    change?: string;
  }>;
  
  /** Show search */
  showSearch?: boolean;
  
  /** Search input value */
  searchValue?: string;
  
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  
  /** Search placeholder */
  searchPlaceholder?: string;
  
  /** Sort options */
  sortOptions?: Array<{
    value: string;
    label: string;
  }>;
  
  /** Sort value */
  sortValue?: string;
  
  /** Sort change handler */
  onSortChange?: (value: string) => void;
  
  /** Filter options */
  filterOptions?: Array<{
    value: string;
    label: string;
  }>;
  
  /** Filter value */
  filterValue?: string;
  
  /** Filter change handler */
  onFilterChange?: (value: string) => void;
  
  /** Categories */
  categories?: Array<{
    id: string;
    name: string;
    count?: number;
  }>;
  
  /** Selected category */
  selectedCategory?: string;
  
  /** Category change handler */
  onCategoryChange?: (id: string) => void;
  
  /** Empty state */
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  
  /** Filters panel */
  filters?: React.ReactNode;
  
  /** Primary action button */
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
  };
  
  /** Additional actions */
  actions?: React.ReactNode;
  
  /** Main content (table/grid) */
  children?: React.ReactNode;
  
  /** Items array for grid rendering */
  items?: any[];
  
  /** Render function for grid items */
  renderItem?: (item: any) => React.ReactNode;
  
  /** Grid columns */
  gridColumns?: number;
  
  /** Grid gap */
  gap?: 'sm' | 'md' | 'lg';
  
  /** Empty state */
  empty?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick?: () => void;
      href?: string;
    };
  };
  
  /** Show loading state */
  loading?: boolean;
  
  /** Pagination */
  pagination?: React.ReactNode;
}

export const AdminListTemplate: React.FC<AdminListTemplateProps> = ({
  sidebar,
  title,
  description,
  breadcrumbs,
  stats,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  primaryAction,
  actions,
  children,
  empty,
  loading = false,
  pagination,
}) => {
  const isEmpty = React.Children.count(children) === 0 && !loading;
  
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar} aria-label="Admin navigation">
        {sidebar}
      </aside>
      
      {/* Main Content Area */}
      <div className={styles.content}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              {breadcrumbs && (
                <div className={styles.breadcrumbs}>
                  {breadcrumbs}
                </div>
              )}
              <div>
                <h1 className={styles.title}>{title}</h1>
                {description && (
                  <p className={styles.description}>{description}</p>
                )}
              </div>
            </div>
            
            <div className={styles.headerActions}>
              {actions}
              
              {primaryAction && (
                primaryAction.href ? (
                  <a href={primaryAction.href} className={styles.primaryButton}>
                    {primaryAction.icon}
                    <span>{primaryAction.label}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={primaryAction.onClick}
                    className={styles.primaryButton}
                  >
                    {primaryAction.icon}
                    <span>{primaryAction.label}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>{stat.label}</span>
                  {stat.icon && (
                    <div className={styles.statIcon}>{stat.icon}</div>
                  )}
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                {stat.change && (
                  <div className={styles.statChange}>{stat.change}</div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Toolbar */}
        <div className={styles.toolbar}>
          {onSearchChange && (
            <div className={styles.searchContainer}>
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className={styles.searchInput}
              />
            </div>
          )}
          
          {filters && (
            <div className={styles.filters}>
              {filters}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className={styles.mainContent}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading...</p>
            </div>
          ) : isEmpty && empty ? (
            <div className={styles.emptyState}>
              {empty.icon && (
                <div className={styles.emptyIcon}>{empty.icon}</div>
              )}
              <h2 className={styles.emptyTitle}>{empty.title}</h2>
              {empty.description && (
                <p className={styles.emptyDescription}>{empty.description}</p>
              )}
              {empty.action && (
                empty.action.href ? (
                  <a href={empty.action.href} className={styles.emptyButton}>
                    {empty.action.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={empty.action.onClick}
                    className={styles.emptyButton}
                  >
                    {empty.action.label}
                  </button>
                )
              )}
            </div>
          ) : (
            children
          )}
        </div>
        
        {/* Pagination */}
        {pagination && !isEmpty && (
          <div className={styles.pagination}>
            {pagination}
          </div>
        )}
      </div>
    </div>
  );
};
