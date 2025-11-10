/**
 * Overlay Component
 * GHXSTSHIP Entertainment Platform - Background overlay
 */

import * as React from 'react'
import styles from './Overlay.module.css'

export interface OverlayProps {
  isVisible: boolean
  onClick?: () => void
  opacity?: number
  className?: string
}

export const Overlay: React.FC<OverlayProps> = ({
  isVisible,
  onClick,
  opacity = 0.8,
  className = '',
}) => {
  if (!isVisible) return null

  return (
    <div
      className={`${styles.overlay} ${className}`}
      onClick={onClick}
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}

Overlay.displayName = 'Overlay'
