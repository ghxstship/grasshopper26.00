/**
 * VisuallyHidden Component
 * GHXSTSHIP Entertainment Platform - Screen reader only content
 * Accessibility component for hidden but readable content
 */

import * as React from 'react'
import styles from './VisuallyHidden.module.css'

export interface VisuallyHiddenProps {
  children: React.ReactNode
  as?: React.ElementType
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
}) => {
  return <Component className={styles.visuallyHidden}>{children}</Component>
}

VisuallyHidden.displayName = 'VisuallyHidden'
