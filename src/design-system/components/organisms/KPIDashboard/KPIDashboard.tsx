/**
 * KPIDashboard Component
 * GHXSTSHIP Entertainment Platform - Real-time KPI dashboard
 */

import * as React from 'react'
import styles from './KPIDashboard.module.css'

export interface KPIMetric {
  id: string
  title: string
  value: string | number
  unit?: string
  target?: string | number
  change?: number
  status?: 'good' | 'warning' | 'critical'
  description?: string
}

export interface KPIDashboardProps {
  title: string
  metrics: KPIMetric[]
  lastUpdated?: Date
  className?: string
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  title,
  metrics,
  lastUpdated,
  className = '',
}) => {
  return (
    <div className={`${styles.dashboard} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {lastUpdated && (
          <span className={styles.updated}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className={styles.grid}>
        {metrics.map(metric => {
          const hasChange = metric.change !== undefined
          const isPositive = metric.change && metric.change > 0
          const isNegative = metric.change && metric.change < 0

          return (
            <div
              key={metric.id}
              className={`${styles.card} ${metric.status ? styles[metric.status] : ''}`}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{metric.title}</h3>
                {metric.status && (
                  <span className={`${styles.statusIndicator} ${styles[metric.status]}`} />
                )}
              </div>

              <div className={styles.value}>
                <span className={styles.valueNumber}>{metric.value}</span>
                {metric.unit && <span className={styles.unit}>{metric.unit}</span>}
              </div>

              {metric.target && (
                <div className={styles.target}>
                  <span className={styles.targetLabel}>Target:</span>
                  <span className={styles.targetValue}>
                    {metric.target}{metric.unit}
                  </span>
                </div>
              )}

              {hasChange && (
                <div className={styles.change}>
                  <span
                    className={`${styles.changeValue} ${
                      isPositive ? styles.positive : isNegative ? styles.negative : ''
                    }`}
                  >
                    {isPositive && '+'}{metric.change}%
                  </span>
                  <span className={styles.changeLabel}>vs target</span>
                </div>
              )}

              {metric.description && (
                <p className={styles.description}>{metric.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

KPIDashboard.displayName = 'KPIDashboard'
