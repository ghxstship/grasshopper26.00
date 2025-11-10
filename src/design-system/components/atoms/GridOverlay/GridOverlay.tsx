/**
 * GridOverlay Component
 * GHXSTSHIP Entertainment Platform - Structural grid system overlay
 * Geometric grid patterns for layout structure
 */

import * as React from 'react'
import styles from './GridOverlay.module.css'

export type GridSize = 'small' | 'medium' | 'large'
export type GridColor = 'black' | 'white' | 'grey'

export interface GridOverlayProps {
  size?: GridSize
  color?: GridColor
  opacity?: number
  className?: string
  children?: React.ReactNode
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  size = 'medium',
  color = 'grey',
  opacity = 0.05,
  className = '',
  children,
}) => {
  const classNames = [
    styles.gridOverlay,
    styles[size],
    styles[color],
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} style={{ '--grid-opacity': opacity } as React.CSSProperties}>
      {children}
    </div>
  )
}

GridOverlay.displayName = 'GridOverlay'
