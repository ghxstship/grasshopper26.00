'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
}

export function ScrollReveal({ children, direction = 'up', delay = 0 }: ScrollRevealProps) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const directionMap = {
      up: { y: 100, x: 0 },
      down: { y: -100, x: 0 },
      left: { y: 0, x: 100 },
      right: { y: 0, x: -100 },
    }

    const { x, y } = directionMap[direction]

    gsap.fromTo(
      ref.current,
      { y, x, opacity: 0 },
      {
        y: 0,
        x: 0,
        opacity: 1,
        duration: 0.6,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [direction, delay])

  return <div ref={ref}>{children}</div>
}
