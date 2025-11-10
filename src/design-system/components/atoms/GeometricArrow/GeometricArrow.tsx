/**
 * GeometricArrow Component
 * GHXSTSHIP Entertainment Platform - Bold geometric arrow icons
 * Directional indicators with hard geometric shapes
 */

import * as React from 'react'
import styles from './GeometricArrow.module.css'

export type ArrowDirection = 'up' | 'down' | 'left' | 'right'
export type ArrowSize = 'sm' | 'md' | 'lg' | 'xl'
export type ArrowStyle = 'triangle' | 'chevron' | 'thick-line'

export interface GeometricArrowProps {
  direction?: ArrowDirection
  size?: ArrowSize
  style?: ArrowStyle
  className?: string
  'aria-label'?: string
}

export const GeometricArrow: React.FC<GeometricArrowProps> = ({
  direction = 'right',
  size = 'md',
  style = 'triangle',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const classNames = [
    styles.arrow,
    styles[direction],
    styles[size],
    styles[style],
    className,
  ].filter(Boolean).join(' ')

  return (
    <span className={classNames} aria-label={ariaLabel || `Arrow pointing ${direction}`} role="img">
      <span className={styles.shape} aria-hidden="true" />
    </span>
  )
}

GeometricArrow.displayName = 'GeometricArrow'
