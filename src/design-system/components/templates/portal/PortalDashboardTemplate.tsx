/**
 * Portal Dashboard Template
 * Standardized layout for user-facing portal/dashboard pages
 * Used for: Portal home, Credits, Referrals, Vouchers, etc.
 */

'use client';

import { Card, CardContent } from '@/design-system/components/atoms/card';
import { LoadingSpinner } from '@/design-system/components/atoms/loading';
import { cn } from '@/lib/utils';
import styles from './PortalDashboardTemplate.module.css';

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DashboardSection {
  id: string;
  title: string;
  content: React.ReactNode;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  isEmpty?: boolean;
}

export interface PortalDashboardTemplateProps {
  // Header
  greeting: string;
  userInfo?: React.ReactNode;
  
  // Hero Section
  primaryCard?: React.ReactNode;
  statsCards?: StatsCardProps[];
  
  // Content Sections
  sections: DashboardSection[];
  
  // Layout
  layout?: 'single-column' | 'two-column';
  
  // Loading
  loading?: boolean;
  
  // Additional Header Content
  headerActions?: React.ReactNode;
}

export function PortalDashboardTemplate({
  greeting,
  userInfo,
  primaryCard,
  statsCards,
  sections,
  layout = 'single-column',
  loading = false,
  headerActions,
}: PortalDashboardTemplateProps) {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
        <p className={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.greeting}>{greeting}</h1>
          {userInfo && <div className={styles.userInfo}>{userInfo}</div>}
        </div>
        {headerActions && (
          <div className={styles.headerActions}>{headerActions}</div>
        )}
      </div>

      {/* Hero Section */}
      {(primaryCard || statsCards) && (
        <div className={styles.heroSection}>
          {/* Primary Card */}
          {primaryCard && (
            <div className={styles.primaryCard}>{primaryCard}</div>
          )}

          {/* Stats Grid */}
          {statsCards && statsCards.length > 0 && (
            <div className={styles.statsGrid}>
              {statsCards.map((stat, index) => (
                <Card key={index} className={styles.statCard}>
                  <CardContent className={styles.statCardContent}>
                    <div className={styles.statHeader}>
                      <p className={styles.statLabel}>{stat.label}</p>
                      {stat.icon && (
                        <div className={styles.statIcon}>{stat.icon}</div>
                      )}
                    </div>
                    <p className={styles.statValue}>{stat.value}</p>
                    {stat.trend && (
                      <p
                        className={cn(
                          styles.statTrend,
                          stat.trend.direction === 'up' && styles.statTrendUp,
                          stat.trend.direction === 'down' && styles.statTrendDown
                        )}
                      >
                        {stat.trend.direction === 'up' ? '↑' : stat.trend.direction === 'down' ? '↓' : '→'}{' '}
                        {stat.trend.value}%
                        {stat.trend.label && ` ${stat.trend.label}`}
                      </p>
                    )}
                    {stat.action && (
                      <button
                        onClick={stat.action.onClick}
                        className={styles.statAction}
                      >
                        {stat.action.label}
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Sections */}
      <div
        className={cn(
          styles.sectionsContainer,
          layout === 'two-column' && styles.sectionsContainerTwoColumn
        )}
      >
        {sections.map((section) => (
          <section key={section.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            
            {section.isEmpty && section.emptyState ? (
              <Card className={styles.emptyStateCard}>
                <CardContent className={styles.emptyStateContent}>
                  {section.emptyState.icon && (
                    <div className={styles.emptyStateIcon}>
                      {section.emptyState.icon}
                    </div>
                  )}
                  <h3 className={styles.emptyStateTitle}>
                    {section.emptyState.title}
                  </h3>
                  {section.emptyState.description && (
                    <p className={styles.emptyStateDescription}>
                      {section.emptyState.description}
                    </p>
                  )}
                  {section.emptyState.action && (
                    <button
                      onClick={section.emptyState.action.onClick}
                      className={styles.emptyStateAction}
                    >
                      {section.emptyState.action.label}
                    </button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={styles.sectionContent}>{section.content}</div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
