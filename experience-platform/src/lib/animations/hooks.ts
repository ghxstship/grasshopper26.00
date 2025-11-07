import { useEffect, useRef } from 'react';
import { useInView, useAnimation, AnimationControls } from 'framer-motion';

/**
 * Hook to trigger animations when element enters viewport
 * 
 * @param threshold - Percentage of element that must be visible (0-1)
 * @param triggerOnce - Only trigger animation once
 * @returns [ref, controls] - Attach ref to element, use controls for animation
 */
export function useScrollAnimation(
  threshold: number = 0.1,
  triggerOnce: boolean = true
): [React.RefObject<any>, AnimationControls] {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: triggerOnce,
    amount: threshold,
  });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('animate');
    } else if (!triggerOnce) {
      controls.start('initial');
    }
  }, [isInView, controls, triggerOnce]);

  return [ref, controls];
}

/**
 * Hook for parallax scrolling effect
 * 
 * @param speed - Parallax speed multiplier (default: 0.5)
 * @returns [ref, y] - Attach ref to element, use y for transform
 */
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const yValue = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      
      yValue.current = rate;
      ref.current.style.transform = `translateY(${rate}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
}

/**
 * Hook for stagger animation delays
 * 
 * @param index - Index of the element in the list
 * @param baseDelay - Base delay in seconds
 * @param increment - Delay increment per index
 * @returns delay value
 */
export function useStaggerDelay(
  index: number,
  baseDelay: number = 0,
  increment: number = 0.1
): number {
  return baseDelay + (index * increment);
}

/**
 * Hook to detect reduced motion preference
 * 
 * @returns boolean indicating if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion.current = event.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion.current;
}

/**
 * Hook for mouse-following animations
 * 
 * @returns [ref, x, y] - Attach ref to container, x and y are mouse positions
 */
export function useMousePosition() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const y = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      x.current = event.clientX - rect.left;
      y.current = event.clientY - rect.top;
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      return () => element.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return { ref, x: x.current, y: y.current };
}
