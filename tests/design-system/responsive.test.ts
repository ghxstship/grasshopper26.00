/**
 * Responsive Utilities Tests
 * Test breakpoint and responsive helpers
 */

import {
  getCurrentBreakpoint,
  isBreakpointUp,
  isBreakpointDown,
  isBreakpointBetween,
  getMediaQuery,
  isMobile,
  isTablet,
  isDesktop,
  getViewportDimensions,
  isLandscape,
  isPortrait,
} from '@/design-system/utils/responsive';

// Mock window dimensions
function mockWindowDimensions(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}

describe('Responsive Utilities', () => {
  describe('getCurrentBreakpoint', () => {
    it('returns xs for mobile widths', () => {
      mockWindowDimensions(375, 667);
      expect(getCurrentBreakpoint()).toBe('xs');
    });
    
    it('returns md for tablet widths', () => {
      mockWindowDimensions(768, 1024);
      expect(getCurrentBreakpoint()).toBe('md');
    });
    
    it('returns lg for desktop widths', () => {
      mockWindowDimensions(1280, 800);
      expect(getCurrentBreakpoint()).toBe('lg');
    });
  });
  
  describe('isBreakpointUp', () => {
    it('returns true when viewport is at or above breakpoint', () => {
      mockWindowDimensions(1024, 768);
      expect(isBreakpointUp('md')).toBe(true);
      expect(isBreakpointUp('lg')).toBe(true);
    });
    
    it('returns false when viewport is below breakpoint', () => {
      mockWindowDimensions(640, 480);
      expect(isBreakpointUp('md')).toBe(false);
      expect(isBreakpointUp('lg')).toBe(false);
    });
  });
  
  describe('isBreakpointDown', () => {
    it('returns true when viewport is below breakpoint', () => {
      mockWindowDimensions(640, 480);
      expect(isBreakpointDown('md')).toBe(true);
    });
    
    it('returns false when viewport is at or above breakpoint', () => {
      mockWindowDimensions(1024, 768);
      expect(isBreakpointDown('md')).toBe(false);
    });
  });
  
  describe('isBreakpointBetween', () => {
    it('returns true when viewport is between breakpoints', () => {
      mockWindowDimensions(800, 600);
      expect(isBreakpointBetween('md', 'lg')).toBe(true);
    });
    
    it('returns false when viewport is outside range', () => {
      mockWindowDimensions(1280, 800);
      expect(isBreakpointBetween('xs', 'md')).toBe(false);
    });
  });
  
  describe('getMediaQuery', () => {
    it('returns min-width media query by default', () => {
      const query = getMediaQuery('md');
      expect(query).toContain('min-width');
      expect(query).toContain('768px');
    });
    
    it('returns max-width media query when specified', () => {
      const query = getMediaQuery('md', 'max');
      expect(query).toContain('max-width');
    });
  });
  
  describe('Device Type Helpers', () => {
    it('isMobile returns true for mobile widths', () => {
      mockWindowDimensions(375, 667);
      expect(isMobile()).toBe(true);
    });
    
    it('isTablet returns true for tablet widths', () => {
      mockWindowDimensions(768, 1024);
      expect(isTablet()).toBe(true);
    });
    
    it('isDesktop returns true for desktop widths', () => {
      mockWindowDimensions(1280, 800);
      expect(isDesktop()).toBe(true);
    });
  });
  
  describe('Viewport Helpers', () => {
    it('getViewportDimensions returns current dimensions', () => {
      mockWindowDimensions(1920, 1080);
      const dimensions = getViewportDimensions();
      expect(dimensions.width).toBe(1920);
      expect(dimensions.height).toBe(1080);
    });
    
    it('isLandscape returns true for landscape orientation', () => {
      mockWindowDimensions(1920, 1080);
      expect(isLandscape()).toBe(true);
    });
    
    it('isPortrait returns true for portrait orientation', () => {
      mockWindowDimensions(375, 667);
      expect(isPortrait()).toBe(true);
    });
  });
});
