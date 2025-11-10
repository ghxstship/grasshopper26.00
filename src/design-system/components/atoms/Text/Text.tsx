/**
 * Text Component
 * GHXSTSHIP Entertainment Platform - Body text
 * SHARE TECH for body copy
 */

import * as React from 'react'
import styles from './Text.module.css'

export type TextSize = 'sm' | 'md' | 'lg'
export type TextWeight = 'normal' | 'bold'
export type TextAlign = 'left' | 'center' | 'right'

export interface TextProps {
  children: React.ReactNode
  size?: TextSize
  weight?: TextWeight
  align?: TextAlign
  as?: 'p' | 'span' | 'div'
  className?: string
}

export const Text: React.FC<TextProps> = ({
  children,
  size = 'md',
  weight = 'normal',
  align = 'left',
  as: Component = 'p',
  className = '',
}) => {
  const classNames = [
    styles.text,
    styles[size],
    styles[weight],
    styles[`align-${align}`],
    className,
  ].filter(Boolean).join(' ')

  return <Component className={classNames}>{children}</Component>
}

Text.displayName = 'Text'
