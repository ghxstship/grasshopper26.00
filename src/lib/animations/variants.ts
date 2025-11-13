/* eslint-disable no-magic-numbers */
// Animation timing, easing, and transform values are design-specific and cannot be tokenized
import { Variants } from 'framer-motion';

/**
 * Framer Motion Animation Variants
 * Reusable animation configurations for consistent motion design
 */

import { primitives } from '@/design-system/tokens/primitives';

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Scale animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const scaleUp: Variants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
};

// Slide animations
export const slideInUp: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

export const slideInDown: Variants = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
};

export const slideInLeft: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

// Stagger container for animating children
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

// Card animations
export const cardHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

export const cardTap: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.95 },
};

// Button animations
export const buttonHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
  tap: { scale: 0.98 },
};

// Page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// Modal animations
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: {
      duration: 0.15,
    },
  },
};

// Drawer animations
export const drawerSlideIn: Variants = {
  initial: { x: '100%' },
  animate: { 
    x: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: { 
    x: '100%',
    transition: {
      duration: 0.2,
    },
  },
};

// Notification animations
export const notificationSlideIn: Variants = {
  initial: { opacity: 0, y: -50, scale: 0.3 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
    },
  },
};

// Accordion animations
export const accordionContent: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.2,
        delay: 0.1,
      },
    },
  },
};

// Loading animations
export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Parallax effect
export const parallaxSlow: Variants = {
  initial: { y: 0 },
  animate: { y: -50 },
};

export const parallaxFast: Variants = {
  initial: { y: 0 },
  animate: { y: -100 },
};

// Hover lift effect
export const hoverLift: Variants = {
  rest: { y: 0, boxShadow: 'var(--shadow-sm)' },
  hover: { 
    y: -8,
    boxShadow: 'var(--shadow-lg)',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Bounce animation
export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Shake animation (for errors)
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// Success checkmark animation
export const successCheckmark: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Typing indicator
export const typingDot: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
