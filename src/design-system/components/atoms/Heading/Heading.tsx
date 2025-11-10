/**
 * Heading Component
 * GHXSTSHIP Entertainment Platform - Semantic headings
 * ANTON for H1, BEBAS NEUE for H2-H6
 */

import * as React from 'react'
import styles from './Heading.module.css'

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface HeadingProps {
  level?: HeadingLevel
  children: React.ReactNode
  className?: string
  id?: string
}

export const Heading: React.FC<HeadingProps> = ({
  level = 'h2',
  children,
  className = '',
  id,
}) => {
  const Component = level
  const classNames = [styles.heading, styles[level], className].filter(Boolean).join(' ')

  return (
    <Component id={id} className={classNames}>
      {children}
    </Component>
  )
}

Heading.displayName = 'Heading'
