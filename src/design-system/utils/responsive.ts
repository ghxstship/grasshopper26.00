/**
 * Responsive Utilities
 * Breakpoint management and responsive helpers
 */

import { breakpoints } from '../tokens/primitives/breakpoints';

export type Breakpoint = keyof typeof breakpoints;

/**
 * Check if current viewport matches breakpoint
 */
export function useMediaQuery(query: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia(query);
  return mediaQuery.matches;
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  
  if (width >= parseInt(breakpoints['3xl'])) return '3xl';
  if (width >= parseInt(breakpoints['2xl'])) return '2xl';
  if (width >= parseInt(breakpoints.xl)) return 'xl';
  if (width >= parseInt(breakpoints.lg)) return 'lg';
  if (width >= parseInt(breakpoints.md)) return 'md';
  if (width >= parseInt(breakpoints.sm)) return 'sm';
  return 'xs';
}

/**
 * Check if viewport is at or above breakpoint
 */
export function isBreakpointUp(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  return width >= parseInt(breakpoints[breakpoint]);
}

/**
 * Check if viewport is below breakpoint
 */
export function isBreakpointDown(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  return width < parseInt(breakpoints[breakpoint]);
}

/**
 * Check if viewport is between two breakpoints
 */
export function isBreakpointBetween(min: Breakpoint, max: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  return width >= parseInt(breakpoints[min]) && width < parseInt(breakpoints[max]);
}

/**
 * Get media query string for breakpoint
 */
export function getMediaQuery(breakpoint: Breakpoint, type: 'min' | 'max' = 'min'): string {
  const value = breakpoints[breakpoint];
  return type === 'min' 
    ? `(min-width: ${value})`
    : `(max-width: ${value})`;
}

/**
 * Responsive value selector
 * Returns value based on current breakpoint
 */
export function getResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const currentBreakpoint = getCurrentBreakpoint();
  
  // Try current breakpoint first
  if (values[currentBreakpoint] !== undefined) {
    return values[currentBreakpoint]!;
  }
  
  // Fall back to smaller breakpoints
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }
  
  return defaultValue;
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return isBreakpointDown('md');
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  return isBreakpointBetween('md', 'lg');
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
  return isBreakpointUp('lg');
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - legacy property
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Check if viewport is in landscape orientation
 */
export function isLandscape(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth > window.innerHeight;
}

/**
 * Check if viewport is in portrait orientation
 */
export function isPortrait(): boolean {
  return !isLandscape();
}

/**
 * Get safe area insets (for notched devices)
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
}
