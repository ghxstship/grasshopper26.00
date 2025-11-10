/**
 * ScreenPrint Component
 * GHXSTSHIP Entertainment Platform - Screen print aesthetic filter
 * High-contrast, sharp edges, flat colors, bold lines
 */

import * as React from 'react'
import styles from './ScreenPrint.module.css'

export type ScreenPrintIntensity = 'subtle' | 'medium' | 'bold'

export interface ScreenPrintProps {
  children: React.ReactNode
  intensity?: ScreenPrintIntensity
  className?: string
}

export const ScreenPrint: React.FC<ScreenPrintProps> = ({
  children,
  intensity = 'medium',
  className = '',
}) => {
  const classNames = [
    styles.screenPrint,
    styles[intensity],
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames}>
      {children}
      <div className={styles.overlay} aria-hidden="true" />
    </div>
  )
}

ScreenPrint.displayName = 'ScreenPrint'
