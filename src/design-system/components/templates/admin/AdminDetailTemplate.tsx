/**
 * Admin Detail Template
 * Standardized layout for admin detail/edit pages
 * Used for: Event details, Artist details, Brand details, etc.
 */

'use client';

import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Badge } from '@/design-system/components/atoms/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/atoms/tabs';
import { LoadingSpinner } from '@/design-system/components/atoms/loading';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import styles from './AdminDetailTemplate.module.css';

export interface AdminBreadcrumbItem {
  label: string;
  href: string;
}

export interface ActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

export interface AdminStatusBadge {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export interface TabConfig {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: string | number;
}

export interface MetadataItem {
  label: string;
  value: React.ReactNode;
}

export interface AdminDetailTemplateProps {
  // Header
  title: string;
  subtitle?: string;
  breadcrumbs?: AdminBreadcrumbItem[];
  backHref?: string;
  
  // Status
  statusBadge?: AdminStatusBadge;
  
  // Actions
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  
  // Tabs (optional)
  tabs?: TabConfig[];
  defaultTab?: string;
  
  // Content (if no tabs)
  children?: React.ReactNode;
  
  // Metadata Sidebar
  metadata?: MetadataItem[];
  showMetadata?: boolean;
  
  // Loading
  loading?: boolean;
}

export function AdminDetailTemplate({
  title,
  subtitle,
  breadcrumbs,
  backHref,
  statusBadge,
  primaryAction,
  secondaryActions,
  tabs,
  defaultTab,
  children,
  metadata,
  showMetadata = true,
  loading = false,
}: AdminDetailTemplateProps) {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  const hasMetadata = showMetadata && metadata && metadata.length > 0;
  const hasTabs = tabs && tabs.length > 0;

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className={styles.breadcrumbItem}>
              <Link href={crumb.href} className={styles.breadcrumbLink}>
                {crumb.label}
              </Link>
              {index < breadcrumbs.length - 1 && (
                <span className={styles.breadcrumbSeparator}>/</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Back Button */}
      {backHref && (
        <Link href={backHref} className={styles.backButton}>
          <ChevronLeft className={styles.backIcon} />
          Back
        </Link>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {statusBadge && (
              <Badge 
                variant={
                  statusBadge.variant === 'success' ? 'default' :
                  statusBadge.variant === 'error' ? 'destructive' :
                  statusBadge.variant === 'warning' ? 'secondary' :
                  statusBadge.variant === 'info' ? 'outline' :
                  'default'
                } 
                className={styles.statusBadge}
              >
                {statusBadge.label}
              </Badge>
            )}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* Actions */}
        {(primaryAction || secondaryActions) && (
          <div className={styles.actions}>
            {secondaryActions && secondaryActions.map((action, index) => (
              action.href ? (
                <Button
                  key={index}
                  asChild
                  variant={action.variant || 'outline'}
                  disabled={action.disabled}
                  className={styles.actionButton}
                >
                  <Link href={action.href}>
                    {action.icon}
                    {action.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  disabled={action.disabled || action.loading}
                  className={styles.actionButton}
                >
                  {action.loading && <LoadingSpinner size="sm" />}
                  {action.icon}
                  {action.label}
                </Button>
              )
            ))}
            
            {primaryAction && (
              primaryAction.href ? (
                <Button
                  asChild
                  variant={primaryAction.variant || 'default'}
                  disabled={primaryAction.disabled}
                  className={styles.primaryActionButton}
                >
                  <Link href={primaryAction.href}>
                    {primaryAction.icon}
                    {primaryAction.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={primaryAction.onClick}
                  variant={primaryAction.variant || 'default'}
                  disabled={primaryAction.disabled || primaryAction.loading}
                  className={styles.primaryActionButton}
                >
                  {primaryAction.loading && <LoadingSpinner size="sm" />}
                  {primaryAction.icon}
                  {primaryAction.label}
                </Button>
              )
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={cn(styles.mainContent, hasMetadata && styles.mainContentWithSidebar)}>
        {/* Content Area */}
        <div className={styles.contentArea}>
          {hasTabs ? (
            <Tabs defaultValue={defaultTab || tabs[0].key} className={styles.tabs}>
              <TabsList className={styles.tabsList}>
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className={styles.tabTrigger}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.badge && (
                      <span className={styles.tabBadge}>{tab.badge}</span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {tabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key} className={styles.tabContent}>
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            children
          )}
        </div>

        {/* Metadata Sidebar */}
        {hasMetadata && (
          <aside className={styles.sidebar}>
            <Card className={styles.metadataCard}>
              <CardContent className={styles.metadataContent}>
                <h3 className={styles.metadataTitle}>Details</h3>
                <dl className={styles.metadataList}>
                  {metadata.map((item, index) => (
                    <div key={index} className={styles.metadataItem}>
                      <dt className={styles.metadataLabel}>{item.label}</dt>
                      <dd className={styles.metadataValue}>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}
