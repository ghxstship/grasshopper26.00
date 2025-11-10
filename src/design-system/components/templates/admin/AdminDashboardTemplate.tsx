/**
 * Admin Dashboard Template
 * Standardized layout for admin overview/dashboard pages
 * Used for: Admin dashboard, Analytics overview, Reports
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/atoms/tabs';
import { LoadingSpinner } from '@/design-system/components/atoms/loading';
import { cn } from '@/lib/utils';
import styles from './AdminDashboardTemplate.module.css';

export interface DashboardStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  meta?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
}

export interface DashboardTab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface QuickAction {
  label: string;
  description?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export interface AdminDashboardTemplateProps {
  // Header
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  
  // Stats Grid
  stats: DashboardStat[];
  
  // Content Tabs (optional)
  tabs?: DashboardTab[];
  defaultTab?: string;
  
  // Quick Actions (optional)
  quickActions?: QuickAction[];
  
  // Content (if no tabs)
  children?: React.ReactNode;
  
  // Loading
  loading?: boolean;
}

export function AdminDashboardTemplate({
  title,
  subtitle,
  primaryAction,
  stats,
  tabs,
  defaultTab,
  quickActions,
  children,
  loading = false,
}: AdminDashboardTemplateProps) {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
        <p className={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  const hasTabs = tabs && tabs.length > 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {primaryAction && (
          primaryAction.href ? (
            <a href={primaryAction.href} className={styles.primaryAction}>
              {primaryAction.icon}
              {primaryAction.label}
            </a>
          ) : (
            <button onClick={primaryAction.onClick} className={styles.primaryAction}>
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )
        )}
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Card key={index} className={styles.statCard}>
            <CardHeader className={styles.statCardHeader}>
              <CardTitle className={styles.statCardTitle}>{stat.label}</CardTitle>
              <div className={styles.statIcon}>{stat.icon}</div>
            </CardHeader>
            <CardContent className={styles.statCardContent}>
              <div className={styles.statValue}>{stat.value}</div>
              {stat.meta && <p className={styles.statMeta}>{stat.meta}</p>}
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {quickActions && quickActions.length > 0 && (
        <div className={styles.quickActionsSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className={styles.quickActionCard}
                onClick={action.onClick}
              >
                <CardContent className={styles.quickActionContent}>
                  <div className={styles.quickActionIcon}>{action.icon}</div>
                  <div className={styles.quickActionText}>
                    <h3 className={styles.quickActionLabel}>{action.label}</h3>
                    {action.description && (
                      <p className={styles.quickActionDescription}>
                        {action.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Content Tabs or Children */}
      {hasTabs ? (
        <Tabs defaultValue={defaultTab || tabs[0].key} className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className={styles.tabTrigger}>
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className={styles.tabContent}>
              <Card className={styles.tabCard}>
                <CardContent className={styles.tabCardContent}>
                  {tab.content}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        children && <div className={styles.customContent}>{children}</div>
      )}
    </div>
  );
}
