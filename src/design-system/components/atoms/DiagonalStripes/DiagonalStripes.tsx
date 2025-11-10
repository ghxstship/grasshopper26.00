/**
 * DiagonalStripes Component
 * GHXSTSHIP Entertainment Platform - Bold diagonal stripe patterns
 * Geometric texture element for backgrounds and accents
 */

import * as React from 'react'
import styles from './DiagonalStripes.module.css'

export type StripesDirection = 'diagonal-right' | 'diagonal-left' | 'vertical' | 'horizontal'
export type StripesWidth = 'thin' | 'medium' | 'thick'
export type StripesColor = 'black' | 'white' | 'grey'

export interface DiagonalStripesProps {
  direction?: StripesDirection
  width?: StripesWidth
  color?: StripesColor
  opacity?: number
  className?: string
  as?: React.ElementType
  children?: React.ReactNode
}

export const DiagonalStripes: React.FC<DiagonalStripesProps> = ({
  direction = 'diagonal-right',
  width = 'medium',
  color = 'black',
  opacity = 0.1,
  className = '',
  as: Component = 'div',
  children,
}) => {
  const classNames = [
    styles.stripes,
    styles[direction],
    styles[width],
    styles[color],
    className,
  ].filter(Boolean).join(' ')

  return (
    <Component className={classNames} style={{ '--stripes-opacity': opacity } as React.CSSProperties}>
      {children}
    </Component>
  )
}

DiagonalStripes.displayName = 'DiagonalStripes'
