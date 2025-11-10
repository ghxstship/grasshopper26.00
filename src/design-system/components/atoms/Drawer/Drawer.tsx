/**
 * Drawer Component
 * GHXSTSHIP Entertainment Platform - Slide-out panel
 * Geometric slide-in from edge of screen
 */

'use client'

import * as React from 'react'
import { useEffect } from 'react'
import styles from './Drawer.module.css'

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  position?: DrawerPosition
  children: React.ReactNode
  className?: string
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  children,
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} onKeyDown={handleOverlayKeyDown} role="button" tabIndex={0} />
      <div
        className={`${styles.drawer} ${styles[position]} ${className}`}
        role="dialog"
        aria-modal="true"
      >
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Close drawer"
        >
          ✕
        </button>
        <div className={styles.content}>{children}</div>
      </div>
    </>
  )
}

Drawer.displayName = 'Drawer'
