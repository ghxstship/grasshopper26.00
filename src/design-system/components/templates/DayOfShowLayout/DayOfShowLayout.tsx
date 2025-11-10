/**
 * DayOfShowLayout Template
 * GHXSTSHIP Entertainment Platform - Day-of-show operations layout
 */

import * as React from 'react'
import styles from './DayOfShowLayout.module.css'

export interface DayOfShowLayoutProps {
  header: React.ReactNode
  capacityMonitors?: React.ReactNode
  checkInSystem?: React.ReactNode
  incidentBoard?: React.ReactNode
  staffStatus?: React.ReactNode
  liveMetrics?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const DayOfShowLayout: React.FC<DayOfShowLayoutProps> = ({
  header,
  capacityMonitors,
  checkInSystem,
  incidentBoard,
  staffStatus,
  liveMetrics,
  footer,
  className = '',
}) => {
  return (
    <div className={`${styles.layout} ${className}`}>
      {header && <header className={styles.header}>{header}</header>}

      <div className={styles.content}>
        {liveMetrics && (
          <section className={styles.metrics}>{liveMetrics}</section>
        )}

        {capacityMonitors && (
          <section className={styles.capacity}>{capacityMonitors}</section>
        )}

        <div className={styles.grid}>
          {checkInSystem && (
            <section className={styles.gridItem}>{checkInSystem}</section>
          )}

          {staffStatus && (
            <section className={styles.gridItem}>{staffStatus}</section>
          )}
        </div>

        {incidentBoard && (
          <section className={styles.incidents}>{incidentBoard}</section>
        )}
      </div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  )
}

DayOfShowLayout.displayName = 'DayOfShowLayout'
