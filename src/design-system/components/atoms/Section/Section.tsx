/**
 * Section Component
 * GHXSTSHIP Entertainment Platform - Full-width section wrapper
 * Alternating black/white backgrounds per design system
 */

import * as React from 'react'
import styles from './Section.module.css'

export type SectionBackground = 'black' | 'white' | 'grey-light' | 'grey-dark'
export type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface SectionProps {
  children: React.ReactNode
  background?: SectionBackground
  padding?: SectionPadding
  className?: string
  as?: React.ElementType
  id?: string
}

export const Section: React.FC<SectionProps> = ({
  children,
  background = 'white',
  padding = 'lg',
  className = '',
  as: Component = 'section',
  id,
}) => {
  const classNames = [
    styles.section,
    styles[background],
    styles[`padding-${padding}`],
    className,
  ].filter(Boolean).join(' ')

  return (
    <Component id={id} className={classNames}>
      {children}
    </Component>
  )
}

Section.displayName = 'Section'
