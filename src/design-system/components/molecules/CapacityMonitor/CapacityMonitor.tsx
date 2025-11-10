/**
 * CapacityMonitor Component
 * GHXSTSHIP Entertainment Platform - Real-time capacity monitoring
 */

import * as React from 'react'
import styles from './CapacityMonitor.module.css'

export interface CapacityMonitorProps {
  current: number
  capacity: number
  venue: string
  status?: 'normal' | 'warning' | 'critical'
  className?: string
}

export const CapacityMonitor: React.FC<CapacityMonitorProps> = ({
  current,
  capacity,
  venue,
  status = 'normal',
  className = '',
}) => {
  const percentage = (current / capacity) * 100
  const remaining = capacity - current

  const getStatus = () => {
    if (percentage >= 95) return 'critical'
    if (percentage >= 85) return 'warning'
    return 'normal'
  }

  const actualStatus = status || getStatus()

  return (
    <div className={`${styles.monitor} ${styles[actualStatus]} ${className}`}>
      <div className={styles.header}>
        <span className={styles.venue}>{venue}</span>
        <span className={`${styles.statusBadge} ${styles[actualStatus]}`}>
          {actualStatus}
        </span>
      </div>

      <div className={styles.numbers}>
        <div className={styles.numberGroup}>
          <span className={styles.label}>Current</span>
          <span className={styles.value}>{current}</span>
        </div>
        
        <div className={styles.numberGroup}>
          <span className={styles.label}>Capacity</span>
          <span className={styles.value}>{capacity}</span>
        </div>
        
        <div className={styles.numberGroup}>
          <span className={styles.label}>Remaining</span>
          <span className={styles.value}>{remaining}</span>
        </div>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${styles[actualStatus]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={styles.percentage}>{percentage.toFixed(1)}%</span>
      </div>
    </div>
  )
}

CapacityMonitor.displayName = 'CapacityMonitor'
