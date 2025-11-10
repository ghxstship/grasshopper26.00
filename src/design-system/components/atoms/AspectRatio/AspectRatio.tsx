/**
 * AspectRatio Component
 * GHXSTSHIP Entertainment Platform - Maintain aspect ratio for media
 * Ensures consistent image/video dimensions
 */

import * as React from 'react'
import styles from './AspectRatio.module.css'

export type AspectRatioValue = '1/1' | '4/3' | '16/9' | '21/9' | '3/2' | '2/3'

export interface AspectRatioProps {
  children: React.ReactNode
  ratio?: AspectRatioValue | number
  className?: string
}

export const AspectRatio: React.FC<AspectRatioProps> = ({
  children,
  ratio = '16/9',
  className = '',
}) => {
  const getRatioValue = () => {
    if (typeof ratio === 'number') return ratio
    
    const ratioMap: Record<AspectRatioValue, number> = {
      '1/1': 1,
      '4/3': 4 / 3,
      '16/9': 16 / 9,
      '21/9': 21 / 9,
      '3/2': 3 / 2,
      '2/3': 2 / 3,
    }
    
    return ratioMap[ratio] || 16 / 9
  }

  const paddingBottom = `${(1 / getRatioValue()) * 100}%`

  return (
    <div className={`${styles.aspectRatio} ${className}`}>
      <div className={styles.inner} style={{ paddingBottom }}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}

AspectRatio.displayName = 'AspectRatio'
