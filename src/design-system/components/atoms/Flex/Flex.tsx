/**
 * Flex Component
 * GHXSTSHIP Entertainment Platform - Flexbox utility
 */

import * as React from 'react'
import styles from './Flex.module.css'

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface FlexProps {
  children: React.ReactNode
  direction?: FlexDirection
  wrap?: FlexWrap
  justify?: FlexJustify
  align?: FlexAlign
  gap?: FlexGap
  className?: string
  as?: React.ElementType
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap = 'md',
  className = '',
  as: Component = 'div',
}) => {
  const classNames = [
    styles.flex,
    styles[`direction-${direction}`],
    styles[`wrap-${wrap}`],
    styles[`justify-${justify}`],
    styles[`align-${align}`],
    styles[`gap-${gap}`],
    className,
  ].filter(Boolean).join(' ')

  return <Component className={classNames}>{children}</Component>
}

Flex.displayName = 'Flex'
