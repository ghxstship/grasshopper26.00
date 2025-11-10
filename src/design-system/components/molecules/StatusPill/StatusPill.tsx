/**
 * StatusPill Component
 * GHXSTSHIP Entertainment Platform - Status indicator pill
 */

import * as React from 'react'
import styles from './StatusPill.module.css'

export interface StatusPillProps {
  status: 'active' | 'pending' | 'completed' | 'cancelled' | 'error' | 'warning'
  label?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  size = 'medium',
  className = '',
}) => {
  const displayLabel = label || status

  return (
    <span className={`${styles.pill} ${styles[status]} ${styles[size]} ${className}`}>
      {displayLabel}
    </span>
  )
}

StatusPill.displayName = 'StatusPill'
