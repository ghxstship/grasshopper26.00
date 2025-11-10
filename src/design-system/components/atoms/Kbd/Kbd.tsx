/**
 * Kbd Component
 * GHXSTSHIP Entertainment Platform - Keyboard key display
 * Shows keyboard shortcuts in geometric style
 */

import * as React from 'react'
import styles from './Kbd.module.css'

export interface KbdProps {
  children: React.ReactNode
  className?: string
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return <kbd className={`${styles.kbd} ${className}`}>{children}</kbd>
}

Kbd.displayName = 'Kbd'
