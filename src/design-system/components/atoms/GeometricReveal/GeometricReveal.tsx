/**
 * GeometricReveal Component
 * GHXSTSHIP Entertainment Platform - Hard-edge geometric wipe transitions
 * NO soft fades, only geometric clip-path animations
 */

'use client'

import * as React from 'react'
import { motion, Variants } from 'framer-motion'

export type GeometricRevealType = 
  | 'wipe-left' 
  | 'wipe-right' 
  | 'wipe-up' 
  | 'wipe-down'
  | 'diagonal-wipe'
  | 'center-expand'
  | 'corner-expand'

export interface GeometricRevealProps {
  children: React.ReactNode
  type?: GeometricRevealType
  duration?: number
  delay?: number
  className?: string
}

const revealVariants: Record<GeometricRevealType, Variants> = {
  'wipe-left': {
    hidden: { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
    visible: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  },
  'wipe-right': {
    hidden: { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
    visible: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  },
  'wipe-up': {
    hidden: { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
    visible: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  },
  'wipe-down': {
    hidden: { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
    visible: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  },
  'diagonal-wipe': {
    hidden: { clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)' },
    visible: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  },
  'center-expand': {
    hidden: { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' },
    visible: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  },
  'corner-expand': {
    hidden: { clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)' },
    visible: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
  },
}

export const GeometricReveal: React.FC<GeometricRevealProps> = ({
  children,
  type = 'wipe-left',
  duration = 0.5,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={revealVariants[type]}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

GeometricReveal.displayName = 'GeometricReveal'
