/**
 * AnalyticsDashboardLayout Template
 * GHXSTSHIP Entertainment Platform - Analytics and KPI reporting layout
 */

import * as React from 'react'
import styles from './AnalyticsDashboardLayout.module.css'

export interface AnalyticsDashboardLayoutProps {
  header: React.ReactNode
  filters?: React.ReactNode
  kpiGrid: React.ReactNode
  charts?: React.ReactNode
  tables?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const AnalyticsDashboardLayout: React.FC<AnalyticsDashboardLayoutProps> = ({
  header,
  filters,
  kpiGrid,
  charts,
  tables,
  footer,
  className = '',
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      {header && <header className={styles.header}>{header}</header>}

      <div className={styles.content}>
        {filters && (
          <section className={styles.filters}>{filters}</section>
        )}

        <section className={styles.kpiSection}>{kpiGrid}</section>

        {charts && (
          <section className={styles.chartsSection}>{charts}</section>
        )}

        {tables && (
          <section className={styles.tablesSection}>{tables}</section>
        )}
      </div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}

AnalyticsDashboardLayout.displayName = 'AnalyticsDashboardLayout'
