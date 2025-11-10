/**
 * Grid Component
 * GHXSTSHIP Entertainment Platform - Responsive grid layout
 * Asymmetric grids inspired by Acceleration CC
 */

import * as React from 'react'
import styles from './Grid.module.css'

export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface GridProps {
  children: React.ReactNode
  columns?: GridColumns | { mobile?: GridColumns; tablet?: GridColumns; desktop?: GridColumns }
  gap?: GridGap
  className?: string
  as?: React.ElementType
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 12,
  gap = 'md',
  className = '',
  as: Component = 'div',
}) => {
  const getColumnClasses = () => {
    if (typeof columns === 'number') {
      return styles[`cols-${columns}`]
    }
    
    const classes = []
    if (columns.mobile) classes.push(styles[`cols-mobile-${columns.mobile}`])
    if (columns.tablet) classes.push(styles[`cols-tablet-${columns.tablet}`])
    if (columns.desktop) classes.push(styles[`cols-desktop-${columns.desktop}`])
    return classes.join(' ')
  }

  const classNames = [
    styles.grid,
    getColumnClasses(),
    styles[`gap-${gap}`],
    className,
  ].filter(Boolean).join(' ')

  return <Component className={classNames}>{children}</Component>
}

Grid.displayName = 'Grid'
