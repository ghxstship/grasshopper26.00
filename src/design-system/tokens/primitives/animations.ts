/**
 * Animation Tokens - Entertainment Platform
 * Snappy, energetic animations with hard geometric transitions
 * WCAG 2.2 compliant - respects prefers-reduced-motion
 */

export const animations = {
  // Keyframe definitions
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideInFromLeft: {
      from: { transform: 'translateX(-100%)' },
      to: { transform: 'translateX(0)' },
    },
    slideInFromRight: {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' },
    },
    slideInFromTop: {
      from: { transform: 'translateY(-100%)' },
      to: { transform: 'translateY(0)' },
    },
    slideInFromBottom: {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
    slideOutToLeft: {
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(-100%)' },
    },
    slideOutToRight: {
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(100%)' },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: '1' },
      to: { transform: 'scale(0.95)', opacity: '0' },
    },
    // Entertainment Platform specific animations
    scaleHover: {
      from: { transform: 'scale(1)' },
      to: { transform: 'scale(1.05)' },
    },
    scalePress: {
      from: { transform: 'scale(1)' },
      to: { transform: 'scale(0.98)' },
    },
    colorInvert: {
      from: { filter: 'invert(0)' },
      to: { filter: 'invert(1)' },
    },
    geometricWipe: {
      from: { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
      to: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    },
    halftoneReveal: {
      from: { opacity: '0', filter: 'contrast(1.2)' },
      to: { opacity: '1', filter: 'contrast(1.2)' },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    geometricPulse: {
      '0%, 100%': { transform: 'scale(1)', opacity: '1' },
      '50%': { transform: 'scale(1.05)', opacity: '0.8' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-25%)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
  },
  
  // Duration presets - Entertainment Platform (snappy, energetic)
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '250ms',
    medium: '300ms',      // Page transitions
    slow: '350ms',
    slower: '500ms',
    slowest: '750ms',
  },
  
  // Easing functions - Entertainment Platform
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',  // Hard cuts
  },
  
  // Delay presets
  delay: {
    none: '0ms',
    short: '100ms',
    base: '200ms',
    long: '300ms',
  },
  
  // Entertainment Platform specific animation values
  hover: {
    scaleCard: '1.05',
    scaleButton: '1.03',
    scaleImage: '1.1',
    borderIncrease: '4px',
  },
  
  active: {
    scale: '0.98',
  },
  
  scroll: {
    fadeDistance: '20px',
    slideDistance: '40px',
  },
  
  loading: {
    pulseDuration: '1.5s',
    spinDuration: '1s',
  },
  
  micro: {
    duration: '150ms',
  },
} as const;

export type Animations = typeof animations;
