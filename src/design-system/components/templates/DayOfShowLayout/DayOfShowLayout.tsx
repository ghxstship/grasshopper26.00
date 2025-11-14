/**
 * DayOfShowLayout Template
 * GHXSTSHIP Design System
 * Specialized layout for event staff day-of-show operations
 */

import React from 'react';
import { PageTemplate } from '../PageTemplate';
import styles from './DayOfShowLayout.module.css';

export interface DayOfShowLayoutProps {
  header?: React.ReactNode;
  liveMetrics?: React.ReactNode;
  capacityMonitors?: React.ReactNode;
  checkInSystem?: React.ReactNode;
  staffStatus?: React.ReactNode;
  footer?: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function DayOfShowLayout({
  header,
  liveMetrics,
  capacityMonitors,
  checkInSystem,
  staffStatus,
  footer,
  showHeader = false,
  showFooter = false,
}: DayOfShowLayoutProps) {
  return (
    <PageTemplate showHeader={showHeader} showFooter={showFooter}>
      <div className={styles.container}>
        {header && (
          <div className={styles.stickyHeader}>
            {header}
          </div>
        )}
        
        <div className={styles.content}>
          {liveMetrics && (
            <section className={styles.section}>
              {liveMetrics}
            </section>
          )}
          
          {capacityMonitors && (
            <section className={styles.section}>
              {capacityMonitors}
            </section>
          )}
          
          {checkInSystem && (
            <section className={styles.section}>
              {checkInSystem}
            </section>
          )}
          
          {staffStatus && (
            <section className={styles.section}>
              {staffStatus}
            </section>
          )}
          
          {footer && (
            <section className={styles.section}>
              {footer}
            </section>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
