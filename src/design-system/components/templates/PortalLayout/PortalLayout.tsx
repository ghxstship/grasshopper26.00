/**
 * Portal Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Member portal with sidebar navigation and dashboard content
 */

import * as React from "react";
import styles from './PortalLayout.module.css';

export interface PortalLayoutProps {
  /** Header/navigation */
  header?: React.ReactNode;
  
  /** Sidebar navigation */
  sidebar?: React.ReactNode;
  
  /** Page title */
  title?: string;
  
  /** Page description */
  description?: string;
  
  /** Greeting message */
  greeting?: string;
  
  /** User info component */
  userInfo?: React.ReactNode;
  
  /** Stats cards */
  statsCards?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  
  /** Content sections */
  sections?: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    isEmpty?: boolean;
    emptyState?: {
      icon?: React.ReactNode;
      title: string;
      description?: string;
      action?: React.ReactNode;
    };
  }>;
  
  /** Layout variant */
  layout?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Breadcrumbs */
  breadcrumbs?: React.ReactNode;
  
  /** Page actions */
  actions?: React.ReactNode;
  
  /** Main content */
  children?: React.ReactNode;
  
  /** Show sidebar on mobile */
  sidebarOpen?: boolean;
  
  /** Toggle sidebar callback */
  onToggleSidebar?: () => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  header,
  sidebar,
  title,
  description,
  greeting,
  userInfo,
  statsCards,
  sections,
  layout,
  loading,
  breadcrumbs,
  actions,
  children,
  sidebarOpen = false,
  onToggleSidebar,
}) => {
  return (
    <div className={styles.layout}>
      {/* Header */}
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}
      
      {/* Main Container */}
      <div className={styles.container}>
        {/* Sidebar */}
        <aside 
          className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
          aria-label="Portal navigation"
        >
          {sidebar}
        </aside>
        
        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div 
            className={styles.overlay}
            onClick={onToggleSidebar}
            aria-hidden="true"
          />
        )}
        
        {/* Main Content */}
        <main className={styles.main} role="main">
          {/* Loading State */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {/* Page Header */}
              {(breadcrumbs || title || description || greeting || userInfo || actions) && (
                <div className={styles.pageHeader}>
                  {breadcrumbs && (
                    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                      {breadcrumbs}
                    </nav>
                  )}
                  
                  <div className={styles.titleRow}>
                    <div className={styles.titleGroup}>
                      {greeting && (
                        <h1 className={styles.title}>{greeting}</h1>
                      )}
                      {title && !greeting && (
                        <h1 className={styles.title}>{title}</h1>
                      )}
                      {userInfo && (
                        <div className={styles.userInfo}>{userInfo}</div>
                      )}
                      {description && (
                        <p className={styles.description}>{description}</p>
                      )}
                    </div>
                    
                    {actions && (
                      <div className={styles.actions}>
                        {actions}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Stats Cards */}
              {statsCards && statsCards.length > 0 && (
                <div className={styles.statsGrid}>
                  {statsCards.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                      {stat.icon && <div className={styles.statIcon}>{stat.icon}</div>}
                      <div className={styles.statContent}>
                        <p className={styles.statLabel}>{stat.label}</p>
                        <p className={styles.statValue}>{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Sections */}
              {sections && sections.length > 0 ? (
                <div className={layout === 'single-column' ? styles.singleColumn : styles.sectionsGrid}>
                  {sections.map((section) => (
                    <div key={section.id} className={styles.section}>
                      <h2 className={styles.sectionTitle}>{section.title}</h2>
                      {section.isEmpty && section.emptyState ? (
                        <div className={styles.emptyState}>
                          {section.emptyState.icon && (
                            <div className={styles.emptyIcon}>{section.emptyState.icon}</div>
                          )}
                          <h3 className={styles.emptyTitle}>{section.emptyState.title}</h3>
                          {section.emptyState.description && (
                            <p className={styles.emptyDescription}>{section.emptyState.description}</p>
                          )}
                          {section.emptyState.action && (
                            <div className={styles.emptyAction}>{section.emptyState.action}</div>
                          )}
                        </div>
                      ) : (
                        <div className={styles.sectionContent}>{section.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Page Content (when no sections) */
                <div className={styles.content}>
                  {children}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
