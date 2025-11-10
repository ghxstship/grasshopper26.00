/**
 * HardShadow Component
 * GHXSTSHIP Entertainment Platform - Geometric hard shadows
 * NO soft blur shadows - only hard geometric offset shadows
 */

import * as React from 'react'
import styles from './HardShadow.module.css'

export type ShadowSize = 'sm' | 'md' | 'lg' | 'xl'
export type ShadowColor = 'black' | 'white' | 'grey'

export interface HardShadowProps {
  children: React.ReactNode
  size?: ShadowSize
  color?: ShadowColor
  className?: string
  as?: React.ElementType
}

export const HardShadow: React.FC<HardShadowProps> = ({
  children,
  size = 'md',
  color = 'black',
  className = '',
  as: Component = 'div',
}) => {
  const classNames = [
    styles.hardShadow,
    styles[size],
    styles[color],
    className,
  ].filter(Boolean).join(' ')

  return <Component className={classNames}>{children}</Component>
}

HardShadow.displayName = 'HardShadow'
