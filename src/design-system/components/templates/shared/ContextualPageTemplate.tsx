/**
 * ContextualPageTemplate
 * Universal flexible template for pages that need custom layouts
 * while maintaining structural consistency
 */

'use client';

import { ReactNode } from 'react';
import styles from './ContextualPageTemplate.module.css';

export interface ContextualPageBreadcrumb {
  label: string;
  href: string;
}

export interface ContextualPageAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ContextualPageTab {
  id: string;
  label: string;
  content: ReactNode;
  badge?: string | number;
}

export interface ContextualPageTemplateProps {
  // Header
  breadcrumbs?: ContextualPageBreadcrumb[];
  title: string;
  subtitle?: string;
  statusBadge?: {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info';
  };
  
  // Actions
  primaryAction?: ContextualPageAction;
  secondaryActions?: ContextualPageAction[];
  
  // Layout Options
  layout?: 'full-width' | 'centered' | 'sidebar-right' | 'sidebar-left' | 'split-pane' | 'grid-sidebar';
  sidebar?: ReactNode;
  
  // Split Pane Layout (for side-by-side content)
  leftPane?: ReactNode;
  rightPane?: ReactNode;
  splitRatio?: '50-50' | '60-40' | '40-60' | '70-30';
  
  // Grid Sidebar Layout (for multi-column grids with sidebar)
  gridColumns?: 2 | 3 | 4;
  gridGap?: 'sm' | 'md' | 'lg';
  
  // Content Organization
  tabs?: ContextualPageTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  
  // Custom Content Area (main flexibility point)
  children?: ReactNode;
  
  // Content Zones (for complex layouts with multiple distinct areas)
  contentZones?: Array<{
    id: string;
    content: ReactNode;
    className?: string;
  }>;
  
  // Metadata/Info Panel (optional)
  metadata?: Array<{
    icon?: ReactNode;
    label: string;
    value: string | ReactNode;
  }>;
  
  // States
  loading?: boolean;
  error?: string;
  
  // Styling
  className?: string;
  contentClassName?: string;
}

export function ContextualPageTemplate({
  breadcrumbs,
  title,
  subtitle,
  statusBadge,
  primaryAction,
  secondaryActions,
  layout = 'full-width',
  sidebar,
  leftPane,
  rightPane,
  splitRatio = '50-50',
  gridColumns = 3,
  gridGap = 'md',
  tabs,
  activeTab,
  onTabChange,
  children,
  contentZones,
  metadata,
  loading,
  error,
  className,
  contentClassName,
}: ContextualPageTemplateProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const currentTab = tabs?.find(t => t.id === activeTab) || tabs?.[0];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href}>
              {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
              <a href={crumb.href} className={styles.breadcrumbLink}>
                {crumb.label}
              </a>
            </span>
          ))}
        </nav>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{title}</h1>
            {statusBadge && (
              <span className={`${styles.statusBadge} ${styles[`status${statusBadge.variant || 'info'}`]}`}>
                {statusBadge.label}
              </span>
            )}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* Actions */}
        {(primaryAction || secondaryActions) && (
          <div className={styles.actions}>
            {secondaryActions?.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`${styles.actionButton} ${styles.actionSecondary}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className={`${styles.actionButton} ${styles.actionPrimary}`}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </header>

      {/* Metadata Panel */}
      {metadata && metadata.length > 0 && (
        <div className={styles.metadata}>
          {metadata.map((item, index) => (
            <div key={index} className={styles.metadataItem}>
              {item.icon && <span className={styles.metadataIcon}>{item.icon}</span>}
              <div className={styles.metadataContent}>
                <span className={styles.metadataLabel}>{item.label}</span>
                <span className={styles.metadataValue}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`${styles.tab} ${tab.id === (activeTab || tabs[0].id) ? styles.tabActive : ''}`}
            >
              {tab.label}
              {tab.badge && <span className={styles.tabBadge}>{tab.badge}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`${styles.main} ${styles[`layout${layout.replace('-', '')}`]}`}>
        {/* Split Pane Layout */}
        {layout === 'split-pane' && leftPane && rightPane ? (
          <>
            <div className={`${styles.pane} ${styles[`pane${splitRatio.replace('-', '')}`]}`}>
              {leftPane}
            </div>
            <div className={`${styles.pane} ${styles[`pane${splitRatio.split('-').reverse().join('')}`]}`}>
              {rightPane}
            </div>
          </>
        ) : /* Grid Sidebar Layout */
        layout === 'grid-sidebar' ? (
          <>
            <div className={`${styles.gridContent} ${styles[`gridCols${gridColumns}`]} ${styles[`gap${gridGap.charAt(0).toUpperCase() + gridGap.slice(1)}`]}`}>
              {tabs && currentTab ? currentTab.content : children}
            </div>
            {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
          </>
        ) : /* Content Zones Layout */
        contentZones && contentZones.length > 0 ? (
          <div className={styles.contentZones}>
            {contentZones.map((zone) => (
              <div key={zone.id} className={`${styles.contentZone} ${zone.className || ''}`}>
                {zone.content}
              </div>
            ))}
          </div>
        ) : (
          /* Standard Layouts */
          <>
            {/* Sidebar (if layout includes it) */}
            {sidebar && (layout === 'sidebar-right' || layout === 'sidebar-left') && (
              <aside className={styles.sidebar}>{sidebar}</aside>
            )}

            {/* Content */}
            <div className={`${styles.content} ${contentClassName || ''}`}>
              {tabs && currentTab ? currentTab.content : children}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
