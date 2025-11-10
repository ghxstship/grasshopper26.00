'use client'

import { motion } from 'framer-motion'

interface GeometricRevealProps {
  children: React.ReactNode
  delay?: number
}

export function GeometricReveal({ children, delay = 0 }: GeometricRevealProps) {
  return (
    <motion.div
      initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
