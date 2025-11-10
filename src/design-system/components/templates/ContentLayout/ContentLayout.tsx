/**
 * Content Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Article/blog post layout with hero, content, and sidebar
 */

import * as React from "react";
import styles from './ContentLayout.module.css';

export interface ContentLayoutProps {
  /** Header/navigation */
  header?: React.ReactNode;
  
  /** Breadcrumbs navigation */
  breadcrumbs?: Array<{ label: string; href: string }>;
  
  /** Hero image/section */
  hero?: React.ReactNode;
  
  /** Hero image URL */
  heroImage?: string;
  
  /** Article metadata (author, date, tags) */
  metadata?: React.ReactNode;
  
  /** Article title */
  title?: string;
  
  /** Article subtitle/excerpt */
  subtitle?: string;
  
  /** Last updated date */
  lastUpdated?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Primary action button */
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  
  /** Secondary action buttons */
  secondaryActions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  }>;
  
  /** Main content */
  children: React.ReactNode;
  
  /** Sidebar content */
  sidebar?: React.ReactNode;
  
  /** Related content */
  related?: React.ReactNode;
  
  /** Footer */
  footer?: React.ReactNode;
  
  /** Show table of contents */
  showToc?: boolean;
  
  /** Table of contents */
  toc?: React.ReactNode;
}

export const ContentLayout: React.FC<ContentLayoutProps> = ({
  header,
  breadcrumbs,
  hero,
  heroImage,
  metadata,
  title,
  subtitle,
  lastUpdated,
  loading,
  primaryAction,
  secondaryActions,
  children,
  sidebar,
  related,
  footer,
  showToc = false,
  toc,
}) => {
  return (
    <div className={styles.layout}>
      {/* Header */}
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}
      
      {/* Hero */}
      {hero && (
        <div className={styles.hero}>
          {hero}
        </div>
      )}
      
      {/* Article Header */}
      <div className={styles.articleHeader}>
        <div className={styles.articleHeaderContent}>
          {metadata && (
            <div className={styles.metadata}>
              {metadata}
            </div>
          )}
          
          {title && (
            <h1 className={styles.title}>{title}</h1>
          )}
          
          {subtitle && (
            <p className={styles.subtitle}>{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Main Container */}
      <div className={styles.container}>
        {/* Table of Contents (Desktop) */}
        {showToc && toc && (
          <aside className={styles.toc} aria-label="Table of contents">
            {toc}
          </aside>
        )}
        
        {/* Article Content */}
        <article className={styles.article} role="main">
          {children}
        </article>
        
        {/* Sidebar */}
        {sidebar && (
          <aside className={styles.sidebar} aria-label="Sidebar">
            {sidebar}
          </aside>
        )}
      </div>
      
      {/* Related Content */}
      {related && (
        <section className={styles.related} aria-label="Related content">
          {related}
        </section>
      )}
      
      {/* Footer */}
      {footer && (
        <footer className={styles.footer} role="contentinfo">
          {footer}
        </footer>
      )}
    </div>
  );
};
