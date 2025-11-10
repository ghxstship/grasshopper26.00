/**
 * EventDashboardLayout Template
 * GHXSTSHIP Entertainment Platform - Event management dashboard layout
 */

import * as React from 'react'
import styles from './EventDashboardLayout.module.css'

export interface EventDashboardLayoutProps {
  header: React.ReactNode
  sidebar?: React.ReactNode
  kpiSection?: React.ReactNode
  budgetSection?: React.ReactNode
  tasksSection?: React.ReactNode
  vendorsSection?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const EventDashboardLayout: React.FC<EventDashboardLayoutProps> = ({
  header,
  sidebar,
  kpiSection,
  budgetSection,
  tasksSection,
  vendorsSection,
  footer,
  className = '',
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      {header && <header className={styles.header}>{header}</header>}

      <div className={styles.main}>
        {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}

        <div className={styles.content}>
          {kpiSection && (
            <section className={styles.section}>{kpiSection}</section>
          )}

          <div className={styles.grid}>
            {budgetSection && (
              <section className={styles.gridItem}>{budgetSection}</section>
            )}

            {tasksSection && (
              <section className={styles.gridItem}>{tasksSection}</section>
            )}
          </div>

          {vendorsSection && (
            <section className={styles.section}>{vendorsSection}</section>
          )}
        </div>
      </div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}

EventDashboardLayout.displayName = 'EventDashboardLayout'
