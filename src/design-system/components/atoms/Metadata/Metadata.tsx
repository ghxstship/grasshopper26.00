/**
 * Metadata Component
 * GHXSTSHIP Entertainment Platform - Metadata text
 * SHARE TECH MONO for dates, times, tags
 */

import * as React from 'react'
import styles from './Metadata.module.css'

export interface MetadataProps {
  children: React.ReactNode
  uppercase?: boolean
  className?: string
}

export const Metadata: React.FC<MetadataProps> = ({
  children,
  uppercase = true,
  className = '',
}) => {
  const classNames = [
    styles.metadata,
    uppercase && styles.uppercase,
    className,
  ].filter(Boolean).join(' ')

  return <span className={classNames}>{children}</span>
}

Metadata.displayName = 'Metadata'
