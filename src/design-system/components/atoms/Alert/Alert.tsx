/**
 * Alert Component
 * GHXSTSHIP Entertainment Platform - Alert messages
 * Geometric bordered alerts with thick borders
 */

import * as React from 'react'
import styles from './Alert.module.css'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  return (
    <div className={`${styles.alert} ${styles[variant]} ${className}`} role="alert">
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{children}</div>
      </div>
      {onClose && (
        <button className={styles.close} onClick={onClose} aria-label="Close alert">
          ✕
        </button>
      )}
    </div>
  )
}

Alert.displayName = 'Alert'
