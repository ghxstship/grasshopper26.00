/**
 * Code Component
 * GHXSTSHIP Entertainment Platform - Inline code display
 * Monospace code snippets in geometric style
 */

import * as React from 'react'
import styles from './Code.module.css'

export interface CodeProps {
  children: React.ReactNode
  className?: string
}

export const Code: React.FC<CodeProps> = ({ children, className = '' }) => {
  return <code className={`${styles.code} ${className}`}>{children}</code>
}

Code.displayName = 'Code'
