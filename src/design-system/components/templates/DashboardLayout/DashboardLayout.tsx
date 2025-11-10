/**
 * Dashboard Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Full page template with navigation, sidebar, and main content
 */

import * as React from "react"
import { Navigation, type NavigationItem } from '../../organisms/Navigation/Navigation';
import styles from './DashboardLayout.module.css';

export interface DashboardLayoutProps {
  /** Navigation items */
  navItems?: NavigationItem[];
  
  /** Logo component */
  logo?: React.ReactNode;
  
  /** Navigation actions (e.g., user menu, cart) */
  navActions?: React.ReactNode;
  
  /** Page title */
  title?: string;
  
  /** Page subtitle */
  subtitle?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Stats cards */
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
      value: number;
      direction: string;
      label: string;
    };
  }>;
  
  /** Tabs */
  tabs?: Array<{
    key: string;
    label: string;
    content?: React.ReactNode;
  }>;
  
  /** Sidebar content */
  sidebar?: React.ReactNode;
  
  /** Main content */
  children?: React.ReactNode;
  
  /** Footer content */
  footer?: React.ReactNode;
  
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  
  /** Show sidebar */
  showSidebar?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  navItems,
  logo,
  navActions,
  sidebar,
  children,
  footer,
  onNavigate,
  showSidebar = true,
}) => {
  return (
    <div className={styles.layout}>
      {/* Navigation */}
      <Navigation
        logo={logo}
        items={navItems || []}
        actions={navActions}
        onNavigate={onNavigate}
      />
      
      {/* Main Container */}
      <div className={styles.container}>
        {/* Sidebar */}
        {showSidebar && sidebar && (
          <aside className={styles.sidebar} aria-label="Sidebar">
            {sidebar}
          </aside>
        )}
        
        {/* Main Content */}
        <main className={styles.main} role="main">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      {footer && (
        <footer className={styles.footer} role="contentinfo">
          {footer}
        </footer>
      )}
    </div>
  );
};
