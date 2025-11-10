/**
 * Stack Component
 * GHXSTSHIP Entertainment Platform - Vertical/horizontal layout stack
 * Consistent spacing between child elements
 */

import * as React from 'react'
import styles from './Stack.module.css'

export type StackDirection = 'vertical' | 'horizontal'
export type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around'

export interface StackProps {
  children: React.ReactNode
  direction?: StackDirection
  spacing?: StackSpacing
  align?: StackAlign
  justify?: StackJustify
  wrap?: boolean
  className?: string
  as?: React.ElementType
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
  as: Component = 'div',
}) => {
  const classNames = [
    styles.stack,
    styles[direction],
    styles[`spacing-${spacing}`],
    styles[`align-${align}`],
    styles[`justify-${justify}`],
    wrap && styles.wrap,
    className,
  ].filter(Boolean).join(' ')

  return <Component className={classNames}>{children}</Component>
}

Stack.displayName = 'Stack'
