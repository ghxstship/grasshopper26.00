/**
 * Order History Template
 * Standardized layout for displaying user's transaction/order history
 * Used for: Orders, Advances history, Purchase history
 */

'use client';

import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { LoadingSpinner } from '@/design-system/components/atoms/loading';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './OrderHistoryTemplate.module.css';

export interface StatusFilter {
  key: string;
  label: string;
  count?: number;
}

export interface OrderHistoryEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export interface OrderHistoryTemplateProps {
  // Header
  title: string;
  subtitle?: string;
  heroGradient?: boolean;
  
  // Filters
  statusFilters?: StatusFilter[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;
  
  // Date Range (optional)
  dateRangeFilter?: React.ReactNode;
  
  // Orders
  orders: any[];
  renderOrder: (order: any, index: number) => React.ReactNode;
  
  // Empty State
  emptyState?: OrderHistoryEmptyStateProps;
  
  // Loading
  loading?: boolean;
  loadingCount?: number;
  
  // Additional Filters
  additionalFilters?: React.ReactNode;
}

export function OrderHistoryTemplate({
  title,
  subtitle,
  heroGradient = true,
  statusFilters,
  activeFilter,
  onFilterChange,
  dateRangeFilter,
  orders,
  renderOrder,
  emptyState,
  loading = false,
  loadingCount = 3,
  additionalFilters,
}: OrderHistoryTemplateProps) {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={cn(styles.header, heroGradient && styles.headerGradient)}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {/* Filters */}
      {(statusFilters || dateRangeFilter || additionalFilters) && (
        <div className={styles.filtersContainer}>
          {/* Status Filter Tabs */}
          {statusFilters && statusFilters.length > 0 && (
            <div className={styles.statusFilters}>
              {statusFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => onFilterChange?.(filter.key)}
                  className={cn(
                    styles.filterTab,
                    activeFilter === filter.key && styles.filterTabActive
                  )}
                >
                  {filter.label}
                  {filter.count !== undefined && (
                    <span className={styles.filterCount}>{filter.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Additional Filters */}
          {(dateRangeFilter || additionalFilters) && (
            <div className={styles.additionalFilters}>
              {dateRangeFilter}
              {additionalFilters}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            {Array.from({ length: loadingCount }).map((_, index) => (
              <Card key={index} className={styles.skeletonCard}>
                <CardContent className={styles.skeletonContent}>
                  <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonBadge} />
                  </div>
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonText} />
                    <div className={styles.skeletonText} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 && emptyState ? (
          <Card className={styles.emptyStateCard}>
            <CardContent className={styles.emptyStateContent}>
              {emptyState.icon ? (
                <div className={styles.emptyStateIcon}>{emptyState.icon}</div>
              ) : (
                <Package className={styles.emptyStateIconDefault} />
              )}
              <h3 className={styles.emptyStateTitle}>{emptyState.title}</h3>
              {emptyState.description && (
                <p className={styles.emptyStateDescription}>
                  {emptyState.description}
                </p>
              )}
              {emptyState.action && (
                <Button
                  asChild={!!emptyState.action.href}
                  onClick={emptyState.action.onClick}
                  className={styles.emptyStateAction}
                >
                  {emptyState.action.href ? (
                    <a href={emptyState.action.href}>
                      {emptyState.action.label}
                    </a>
                  ) : (
                    emptyState.action.label
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={styles.ordersGrid}>
            {orders.map((order, index) => (
              <div key={order.id || index}>{renderOrder(order, index)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
