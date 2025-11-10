/**
 * Blockquote Component
 * GHXSTSHIP Entertainment Platform - Quote display
 * Bold geometric quote styling
 */

import * as React from 'react'
import styles from './Blockquote.module.css'

export interface BlockquoteProps {
  children: React.ReactNode
  cite?: string
  author?: string
  className?: string
}

export const Blockquote: React.FC<BlockquoteProps> = ({
  children,
  cite,
  author,
  className = '',
}) => {
  return (
    <blockquote className={`${styles.blockquote} ${className}`} cite={cite}>
      <div className={styles.content}>{children}</div>
      {author && <footer className={styles.footer}>— {author}</footer>}
    </blockquote>
  )
}

Blockquote.displayName = 'Blockquote'
