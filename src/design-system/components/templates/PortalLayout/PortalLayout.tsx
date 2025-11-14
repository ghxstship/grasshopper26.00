/**
 * PortalLayout Template
 * GHXSTSHIP Design System
 * Layout for member portal pages with sidebar navigation
 */

import React from 'react';
import { PageTemplate } from '../PageTemplate';
import styles from './PortalLayout.module.css';

export interface PortalLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function PortalLayout({
  children,
  sidebar,
  title,
  description,
  showHeader = true,
  showFooter = true,
}: PortalLayoutProps) {
  return (
    <PageTemplate showHeader={showHeader} showFooter={showFooter}>
      <div className={styles.container}>
        {sidebar && (
          <aside className={styles.sidebar}>
            {sidebar}
          </aside>
        )}
        <main className={styles.main}>
          {(title || description) && (
            <header className={styles.header}>
              {title && <h1 className={styles.title}>{title}</h1>}
              {description && <p className={styles.description}>{description}</p>}
            </header>
          )}
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>
    </PageTemplate>
  );
}
