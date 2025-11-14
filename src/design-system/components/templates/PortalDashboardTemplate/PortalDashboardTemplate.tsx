/**
 * PortalDashboardTemplate
 * GHXSTSHIP Design System
 * Dashboard template for member portal with stats and sections
 */

import React from 'react';
import { PageTemplate } from '../PageTemplate';
import { StatCard } from '../../molecules/StatCard';
import { Loader2 } from 'lucide-react';
import styles from './PortalDashboardTemplate.module.css';

export interface PortalDashboardSection {
  id: string;
  title: string;
  content: React.ReactNode;
  isEmpty?: boolean;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
}

export interface PortalDashboardTemplateProps {
  greeting?: string;
  userInfo?: React.ReactNode;
  statsCards?: Array<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
  }>;
  sections?: PortalDashboardSection[];
  layout?: 'single-column' | 'two-column';
  loading?: boolean;
  children?: React.ReactNode;
}

export function PortalDashboardTemplate({
  greeting,
  userInfo,
  statsCards,
  sections,
  layout = 'single-column',
  loading = false,
  children,
}: PortalDashboardTemplateProps) {
  return (
    <PageTemplate showHeader showFooter>
      <div className={styles.container}>
        {(greeting || userInfo) && (
          <header className={styles.header}>
            {greeting && <h1 className={styles.greeting}>{greeting}</h1>}
            {userInfo && <div className={styles.userInfo}>{userInfo}</div>}
          </header>
        )}

        {statsCards && statsCards.length > 0 && (
          <div className={styles.statsGrid}>
            {statsCards.map((stat, index) => (
              <StatCard
                key={index}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spinner} />
            <p className={styles.loadingText}>Loading...</p>
          </div>
        ) : (
          <>
            {sections && sections.length > 0 && (
              <div className={layout === 'two-column' ? styles.sectionsTwo : styles.sectionsOne}>
                {sections.map((section) => (
                  <section key={section.id} className={styles.section}>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                    {section.isEmpty && section.emptyState ? (
                      <div className={styles.empty}>
                        <div className={styles.emptyIcon}>{section.emptyState.icon}</div>
                        <h3 className={styles.emptyTitle}>{section.emptyState.title}</h3>
                        <p className={styles.emptyDescription}>{section.emptyState.description}</p>
                      </div>
                    ) : (
                      <div className={styles.sectionContent}>{section.content}</div>
                    )}
                  </section>
                ))}
              </div>
            )}
            {children && <div className={styles.customContent}>{children}</div>}
          </>
        )}
      </div>
    </PageTemplate>
  );
}
