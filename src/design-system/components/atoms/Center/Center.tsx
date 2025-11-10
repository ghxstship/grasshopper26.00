/**
 * Center Component
 * GHXSTSHIP Entertainment Platform - Center content utility
 */

import * as React from 'react'
import styles from './Center.module.css'

export interface CenterProps {
  children: React.ReactNode
  maxWidth?: string
  className?: string
  as?: React.ElementType
}

export const Center: React.FC<CenterProps> = ({
  children,
  maxWidth,
  className = '',
  as: Component = 'div',
}) => {
  return (
    <Component
      className={`${styles.center} ${className}`}
      style={maxWidth ? { maxInlineSize: maxWidth } : undefined}
    >
      {children}
    </Component>
  )
}

Center.displayName = 'Center'
