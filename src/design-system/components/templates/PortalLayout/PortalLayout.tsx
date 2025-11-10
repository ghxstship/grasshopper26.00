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
          {/* Page Header */}
          {(breadcrumbs || title || description || actions) && (
            <div className={styles.pageHeader}>
              {breadcrumbs && (
                <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                  {breadcrumbs}
                </nav>
              )}
              
              <div className={styles.titleRow}>
                <div className={styles.titleGroup}>
                  {title && (
                    <h1 className={styles.title}>{title}</h1>
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
          
          {/* Page Content */}
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
