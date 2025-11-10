/**
 * KPICard Component
 * GHXSTSHIP Entertainment Platform - KPI metric display card
 */

import * as React from 'react'
import styles from './KPICard.module.css'

export interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  target?: string | number
  change?: number
  changeLabel?: string
  status?: 'good' | 'warning' | 'critical'
  description?: string
  className?: string
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  target,
  change,
  changeLabel = 'vs target',
  status,
  description,
  className = '',
}) => {
  const hasChange = change !== undefined
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div className={`${styles.card} ${status ? styles[status] : ''} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {status && (
          <span className={`${styles.statusIndicator} ${styles[status]}`} />
        )}
      </div>

      <div className={styles.value}>
        <span className={styles.valueNumber}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>

      {target && (
        <div className={styles.target}>
          <span className={styles.targetLabel}>Target:</span>
          <span className={styles.targetValue}>{target}{unit}</span>
        </div>
      )}

      {hasChange && (
        <div className={styles.change}>
          <span className={`${styles.changeValue} ${isPositive ? styles.positive : isNegative ? styles.negative : ''}`}>
            {isPositive && '+'}{change}%
          </span>
          <span className={styles.changeLabel}>{changeLabel}</span>
        </div>
      )}

      {description && (
        <p className={styles.description}>{description}</p>
      )}
    </div>
  )
}

KPICard.displayName = 'KPICard'
