/**
 * Admin List Template
 * Standardized layout for admin list/index pages
 * Enforces design system compliance and consistent UX
 */

'use client';

import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { LoadingSpinner } from '@/design-system/components/atoms/loading';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import styles from './AdminListTemplate.module.css';

export interface AdminListStatCard {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface AdminListTab {
  key: string;
  label: string;
  count?: number;
}

export interface AdminListEmptyState {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export interface AdminListTemplateProps {
  // Header
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  
  // Stats (optional)
  stats?: AdminListStatCard[];
  
  // Filters
  tabs?: AdminListTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  showSearch?: boolean;
  
  // Content
  loading?: boolean;
  empty?: AdminListEmptyState;
  children: React.ReactNode; // Table or Grid content
  
  // Additional filters (optional)
  additionalFilters?: React.ReactNode;
}

export function AdminListTemplate({
  title,
  subtitle,
  primaryAction,
  stats,
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  onSearch,
  showSearch = true,
  loading = false,
  empty,
  children,
  additionalFilters,
}: AdminListTemplateProps) {
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerBorder}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          
          {primaryAction && (
            <Button asChild className={styles.primaryAction}>
              <Link href={primaryAction.href}>
                {primaryAction.icon}
                {primaryAction.label}
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <p className={styles.statLabel}>{stat.label}</p>
                  {stat.icon && <div className={styles.statIcon}>{stat.icon}</div>}
                </div>
                <p className={styles.statValue}>{stat.value}</p>
                {stat.trend && (
                  <p className={cn(
                    styles.statTrend,
                    stat.trend.direction === 'up' && styles.statTrendUp,
                    stat.trend.direction === 'down' && styles.statTrendDown
                  )}>
                    {stat.trend.direction === 'up' ? '↑' : stat.trend.direction === 'down' ? '↓' : '→'} {stat.trend.value}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {tabs && tabs.length > 0 && (
        <div className={styles.tabsBorder}>
          <div className={styles.tabsContainer}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange?.(tab.key)}
                className={cn(
                  styles.tab,
                  activeTab === tab.key && styles.tabActive
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={styles.tabCount}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Additional Filters */}
      {(showSearch || additionalFilters) && (
        <div className={styles.searchBorder}>
          <div className={styles.searchContainer}>
            {showSearch && (
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className={styles.searchInput}
                />
                {onSearch && (
                  <Button
                    type="button"
                    onClick={onSearch}
                    className={styles.searchButton}
                  >
                    <Search className={styles.searchButtonIcon} />
                    SEARCH
                  </Button>
                )}
              </div>
            )}
            
            {additionalFilters && (
              <div className={styles.additionalFilters}>
                {additionalFilters}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <LoadingSpinner size="lg" />
            <p className={styles.loadingText}>Loading...</p>
          </div>
        ) : empty ? (
          <Card className={styles.emptyCard}>
            <CardContent className={styles.emptyContent}>
              {empty.icon && (
                <div className={styles.emptyIcon}>{empty.icon}</div>
              )}
              <p className={styles.emptyTitle}>{empty.title}</p>
              {empty.description && (
                <p className={styles.emptyDescription}>{empty.description}</p>
              )}
              {empty.action && (
                <Button asChild className={styles.emptyAction}>
                  <Link href={empty.action.href}>
                    {empty.action.label}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
