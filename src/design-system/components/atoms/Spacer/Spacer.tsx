/**
 * Spacer Component
 * GHXSTSHIP Entertainment Platform - Spacing utility
 */

import * as React from 'react'
import styles from './Spacer.module.css'

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

export interface SpacerProps {
  size?: SpacerSize
  direction?: 'vertical' | 'horizontal'
  className?: string
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  direction = 'vertical',
  className = '',
}) => {
  return (
    <div
      className={`${styles.spacer} ${styles[size]} ${styles[direction]} ${className}`}
      aria-hidden="true"
    />
  )
}

Spacer.displayName = 'Spacer'
