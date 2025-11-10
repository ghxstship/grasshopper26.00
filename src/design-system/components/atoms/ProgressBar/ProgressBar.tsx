/**
 * ProgressBar Component
 * GHXSTSHIP Entertainment Platform - Thick geometric progress bar
 * Hard-edged progress indicator
 */

import * as React from 'react'
import styles from './ProgressBar.module.css'

export type ProgressBarSize = 'sm' | 'md' | 'lg'

export interface ProgressBarProps {
  value: number
  max?: number
  size?: ProgressBarSize
  showLabel?: boolean
  className?: string
  'aria-label'?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  className = '',
  'aria-label': ariaLabel = 'Progress',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={`${styles.progressBar} ${styles[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel}
      >
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && (
        <div className={styles.label}>{Math.round(percentage)}%</div>
      )}
    </div>
  )
}

ProgressBar.displayName = 'ProgressBar'
