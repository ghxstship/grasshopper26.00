/**
 * Spinner Component
 * GHXSTSHIP Entertainment Platform - Geometric loading spinner
 * NO circular spinners - geometric shapes animation only
 */

import * as React from 'react'
import styles from './Spinner.module.css'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerStyle = 'square' | 'triangle' | 'bars'

export interface SpinnerProps {
  size?: SpinnerSize
  style?: SpinnerStyle
  className?: string
  'aria-label'?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  style = 'square',
  className = '',
  'aria-label': ariaLabel = 'Loading',
}) => {
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${styles[style]} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <span className={styles.visuallyHidden}>{ariaLabel}</span>
    </div>
  )
}

Spinner.displayName = 'Spinner'
