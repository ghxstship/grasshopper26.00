/**
 * Toast Component
 * GHXSTSHIP Entertainment Platform - Toast notifications
 * Geometric slide-in notifications
 */

'use client'

import * as React from 'react'
import { useEffect } from 'react'
import styles from './Toast.module.css'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface ToastProps {
  variant?: ToastVariant
  message: string
  duration?: number
  onClose: () => void
  position?: ToastPosition
  className?: string
}

export const Toast: React.FC<ToastProps> = ({
  variant = 'info',
  message,
  duration = 5000,
  onClose,
  position = 'bottom-right',
  className = '',
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div
      className={`${styles.toast} ${styles[variant]} ${styles[position]} ${className}`}
      role="alert"
    >
      <div className={styles.message}>{message}</div>
      <button className={styles.close} onClick={onClose} aria-label="Close notification">
        ✕
      </button>
    </div>
  )
}

Toast.displayName = 'Toast'
