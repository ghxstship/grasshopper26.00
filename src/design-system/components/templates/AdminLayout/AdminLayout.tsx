/**
 * Admin Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Admin dashboard with fixed sidebar and content area
 */

import * as React from "react";
import styles from './AdminLayout.module.css';

export interface AdminLayoutProps {
  /** Sidebar navigation */
  sidebar: React.ReactNode;
  
  /** Top bar with user menu */
  topBar?: React.ReactNode;
  
  /** Page title */
  title?: string;
  
  /** Page description */
  description?: string;
  
  /** Breadcrumbs */
  breadcrumbs?: React.ReactNode;
  
  /** Page actions */
  actions?: React.ReactNode;
  
  /** Main content */
  children: React.ReactNode;
  
  /** Show mobile menu */
  mobileMenuOpen?: boolean;
  
  /** Toggle mobile menu */
  onToggleMobileMenu?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  sidebar,
  topBar,
  title,
  description,
  breadcrumbs,
  actions,
  children,
  mobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside 
        className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}
        aria-label="Admin navigation"
      >
        {sidebar}
      </aside>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={onToggleMobileMenu}
          aria-hidden="true"
        />
      )}
      
      {/* Main Content Area */}
      <div className={styles.content}>
        {/* Top Bar */}
        {topBar && (
          <div className={styles.topBar}>
            {topBar}
          </div>
        )}
        
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
        
        {/* Main Content */}
        <main className={styles.main} role="main">
          {children}
        </main>
      </div>
    </div>
  );
};
