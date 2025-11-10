/**
 * ScrollReveal Component
 * GHXSTSHIP Entertainment Platform - GSAP scroll-triggered animations
 * Geometric reveals with hard cuts, no soft fades
 */

'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none'

export interface ScrollRevealProps {
  children: React.ReactNode
  direction?: RevealDirection
  delay?: number
  duration?: number
  start?: string
  end?: string
  scrub?: boolean
  markers?: boolean
  className?: string
  once?: boolean
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  start = 'top bottom-=100',
  end,
  scrub = false,
  markers = false,
  className = '',
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    const fromVars: gsap.TweenVars = { opacity: 0 }
    const toVars: gsap.TweenVars = { opacity: 1 }

    switch (direction) {
      case 'up':
        fromVars.y = 100
        toVars.y = 0
        break
      case 'down':
        fromVars.y = -100
        toVars.y = 0
        break
      case 'left':
        fromVars.x = 100
        toVars.x = 0
        break
      case 'right':
        fromVars.x = -100
        toVars.x = 0
        break
      case 'scale':
        fromVars.scale = 0.8
        toVars.scale = 1
        break
      case 'none':
        delete fromVars.y
        delete fromVars.x
        delete fromVars.scale
        break
    }

    const animation = gsap.fromTo(element, fromVars, {
      ...toVars,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub,
        markers,
        toggleActions: once ? 'play none none none' : 'play none none reverse',
      },
    })

    return () => {
      animation.kill()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [direction, delay, duration, start, end, scrub, markers, once])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

ScrollReveal.displayName = 'ScrollReveal'
