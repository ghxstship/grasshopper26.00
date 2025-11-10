/**
 * Popover Component
 * GHXSTSHIP Entertainment Platform - Popover overlay
 * Geometric positioned content overlay
 */

'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import styles from './Popover.module.css'

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'

export interface PopoverProps {
  trigger: React.ReactNode
  content: React.ReactNode
  position?: PopoverPosition
  className?: string
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  position = 'bottom',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`${styles.popover} ${className}`} ref={popoverRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
      >{trigger}</div>
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className={`${styles.content} ${styles[position]}`} role="dialog">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

Popover.displayName = 'Popover'
