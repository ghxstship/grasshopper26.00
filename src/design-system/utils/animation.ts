/**
 * Animation Utilities
 * GHXSTSHIP Contemporary Minimal Pop Art Animation System
 * Hard geometric transitions, no soft fades
 * 
 * @design-system-exemption This file contains animation calculations that require px units
 * for transform offsets, border widths, and intersection observer margins
 */
/* eslint-disable no-restricted-syntax */

export type AnimationDuration = 'instant' | 'fast' | 'normal' | 'slow';
export type AnimationEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'sharp';

/**
 * Animation duration constants (in ms)
 */
export const ANIMATION_DURATION: Record<AnimationDuration, number> = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Easing functions for GHXSTSHIP aesthetic
 */
export const ANIMATION_EASING: Record<AnimationEasing, string> = {
  linear: 'linear',
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)', // Sharp, geometric feel
} as const;

/**
 * Geometric transition types
 */
export type GeometricTransition = 
  | 'hard-cut'
  | 'wipe-left'
  | 'wipe-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'diagonal-wipe'
  | 'circle-expand'
  | 'square-expand'
  | 'split-horizontal'
  | 'split-vertical';

/**
 * Get CSS transition string
 */
export function getTransition(
  property: string | string[],
  duration: AnimationDuration = 'normal',
  easing: AnimationEasing = 'ease-out'
): string {
  const props = Array.isArray(property) ? property : [property];
  const durationMs = ANIMATION_DURATION[duration];
  const easingFn = ANIMATION_EASING[easing];
  
  return props
    .map(prop => `${prop} ${durationMs}ms ${easingFn}`)
    .join(', ');
}

/**
 * Scale animation for hover effects
 */
export function getScaleAnimation(scale: number = 1.05): {
  transform: string;
  transition: string;
} {
  return {
    transform: `scale(${scale})`,
    transition: getTransition('transform', 'fast', 'ease-out'),
  };
}

/**
 * Color inversion animation (GHXSTSHIP signature effect)
 */
export function getInvertAnimation(): {
  filter: string;
  transition: string;
} {
  return {
    filter: 'invert(1)',
    transition: getTransition('filter', 'fast', 'ease-out'),
  };
}

/**
 * Hard geometric shadow animation
 * @design-system-exemption Shadow offset calculation requires px units
 */
export function getGeometricShadow(
  offsetX: number = 8,
  offsetY: number = 8,
  color: string = 'var(--color-primary)'
): string {
  return `${offsetX}px ${offsetY}px 0 ${color}`; // eslint-disable-line no-restricted-syntax
}

/**
 * Slide animation
 */
export function getSlideAnimation(
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 20
): {
  transform: string;
  opacity: number;
} {
  const transforms: Record<typeof direction, string> = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  };

  return {
    transform: transforms[direction],
    opacity: 0,
  };
}

/**
 * Reveal animation (for scroll triggers)
 */
export function getRevealAnimation(): {
  initial: { opacity: number; transform: string };
  animate: { opacity: number; transform: string };
  transition: { duration: number; ease: string };
} {
  return {
    initial: { opacity: 0, transform: 'translateY(20px)' },
    animate: { opacity: 1, transform: 'translateY(0)' },
    transition: { 
      duration: ANIMATION_DURATION.normal / 1000, 
      ease: 'easeOut' 
    },
  };
}

/**
 * Stagger animation for lists
 */
export function getStaggerAnimation(index: number, baseDelay: number = 50): {
  style: { transitionDelay: string };
} {
  return {
    style: { transitionDelay: `${index * baseDelay}ms` },
  };
}

/**
 * Border thickness animation for hover
 */
export function getBorderAnimation(
  normalWidth: number = 2,
  hoverWidth: number = 4
): {
  borderWidth: string;
  transition: string;
} {
  return {
    borderWidth: `${normalWidth}px`,
    transition: getTransition('border-width', 'fast', 'ease-out'),
  };
}

/**
 * Geometric loading animation keyframes
 */
export const GEOMETRIC_LOADING_KEYFRAMES = {
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  rotate: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  square: {
    '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
    '50%': { transform: 'scale(1.2) rotate(45deg)' },
  },
  halftone: {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.5)' },
  },
} as const;

/**
 * Page transition variants for Framer Motion
 */
export const PAGE_TRANSITION_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: ANIMATION_DURATION.normal / 1000 },
} as const;

/**
 * Geometric wipe transition
 */
export function getWipeTransition(direction: 'left' | 'right' | 'up' | 'down'): {
  initial: { clipPath: string };
  animate: { clipPath: string };
  exit: { clipPath: string };
} {
  const clipPaths: Record<typeof direction, { in: string; out: string }> = {
    left: {
      in: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      out: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
    right: {
      in: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      out: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
    up: {
      in: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
      out: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
    down: {
      in: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
      out: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    },
  };

  return {
    initial: { clipPath: clipPaths[direction].in },
    animate: { clipPath: clipPaths[direction].out },
    exit: { clipPath: clipPaths[direction].in },
  };
}

/**
 * Scroll-triggered animation observer
 */
export class ScrollAnimationObserver {
  private observer: IntersectionObserver | null = null;
  private elements: Map<Element, () => void> = new Map();

  constructor(
    private options: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    }
  ) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        options
      );
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const callback = this.elements.get(entry.target);
        if (callback) {
          callback();
          this.unobserve(entry.target);
        }
      }
    });
  }

  observe(element: Element, callback: () => void): void {
    if (!this.observer) return;
    
    this.elements.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    if (!this.observer) return;
    
    this.elements.delete(element);
    this.observer.unobserve(element);
  }

  disconnect(): void {
    if (!this.observer) return;
    
    this.observer.disconnect();
    this.elements.clear();
  }
}

/**
 * Parallax effect calculator
 */
export function calculateParallax(
  scrollY: number,
  speed: number = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
): { transform: string } {
  const offset = scrollY * speed;
  
  return {
    transform: direction === 'vertical' 
      ? `translateY(${offset}px)` 
      : `translateX(${offset}px)`,
  };
}

/**
 * Micro-interaction animations
 */
export const MICRO_ANIMATIONS = {
  buttonPress: {
    transform: 'scale(0.98)',
    transition: getTransition('transform', 'instant', 'ease-out'),
  },
  inputFocus: {
    borderWidth: '3px',
    transition: getTransition('border-width', 'fast', 'ease-out'),
  },
  checkboxCheck: {
    transform: 'scale(1.1)',
    transition: getTransition('transform', 'fast', 'sharp'),
  },
  tooltipReveal: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: getTransition(['opacity', 'transform'], 'fast', 'ease-out'),
  },
} as const;

/**
 * Create animation class names for CSS
 */
export function getAnimationClassName(
  type: 'fade' | 'slide' | 'scale' | 'rotate',
  direction?: 'in' | 'out'
): string {
  return `animate-${type}${direction ? `-${direction}` : ''}`;
}

/**
 * Get safe animation duration (respects reduced motion preference)
 */
export function getSafeAnimationDuration(duration: AnimationDuration): number {
  // Check for reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }
  return ANIMATION_DURATION[duration];
}
