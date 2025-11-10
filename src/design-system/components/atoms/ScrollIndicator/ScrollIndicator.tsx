/**
 * ScrollIndicator Component
 * GHXSTSHIP Entertainment Platform - Geometric scroll progress indicator
 * Thick line or geometric shapes showing scroll progress
 */

'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import styles from './ScrollIndicator.module.css'

export type IndicatorStyle = 'line' | 'circle' | 'square'
export type IndicatorPosition = 'top' | 'bottom' | 'left' | 'right'

export interface ScrollIndicatorProps {
  style?: IndicatorStyle
  position?: IndicatorPosition
  thickness?: number
  className?: string
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  style = 'line',
  position = 'top',
  thickness = 3,
  className = '',
}) => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const classNames = [
    styles.indicator,
    styles[style],
    styles[position],
    className,
  ].filter(Boolean).join(' ')

  const progressStyle = {
    '--scroll-progress': `${scrollProgress}%`,
    '--indicator-thickness': `${thickness}px`,
  } as React.CSSProperties

  return (
    <div className={classNames} style={progressStyle} aria-hidden="true">
      <div className={styles.progress} />
    </div>
  )
}

ScrollIndicator.displayName = 'ScrollIndicator'
