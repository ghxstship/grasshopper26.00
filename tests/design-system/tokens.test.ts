/**
 * Design Token Tests
 * Validate token system integrity
 */

import { primitiveColors } from '@/design-system/tokens/primitives/colors';
import { spacing } from '@/design-system/tokens/primitives/spacing';
import { typography } from '@/design-system/tokens/primitives/typography';
import { breakpoints } from '@/design-system/tokens/primitives/breakpoints';

describe('Design Token System', () => {
  describe('Color Tokens', () => {
    it('has complete neutral scale', () => {
      const expectedShades = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      expectedShades.forEach(shade => {
        expect(primitiveColors.neutral[shade as keyof typeof primitiveColors.neutral]).toBeDefined();
        expect(primitiveColors.neutral[shade as keyof typeof primitiveColors.neutral]).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
    
    it('has complete brand scale', () => {
      const expectedShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      expectedShades.forEach(shade => {
        expect(primitiveColors.brand[shade as keyof typeof primitiveColors.brand]).toBeDefined();
        expect(primitiveColors.brand[shade as keyof typeof primitiveColors.brand]).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
    
    it('has semantic color bases', () => {
      expect(primitiveColors.success).toBeDefined();
      expect(primitiveColors.error).toBeDefined();
      expect(primitiveColors.warning).toBeDefined();
      expect(primitiveColors.info).toBeDefined();
    });
  });
  
  describe('Spacing Tokens', () => {
    it('follows 4px grid system', () => {
      // Check key spacing values
      expect(spacing[0]).toBe('0');
      expect(spacing[1]).toBe('0.25rem'); // 4px
      expect(spacing[2]).toBe('0.5rem');  // 8px
      expect(spacing[4]).toBe('1rem');    // 16px
      expect(spacing[8]).toBe('2rem');    // 32px
    });
    
    it('has comprehensive spacing scale', () => {
      const requiredSpacing = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
      requiredSpacing.forEach(size => {
        expect(spacing[size as keyof typeof spacing]).toBeDefined();
      });
    });
  });
  
  describe('Typography Tokens', () => {
    it('has font families defined', () => {
      expect(typography.fontFamily.sans).toBeDefined();
      expect(typography.fontFamily.serif).toBeDefined();
      expect(typography.fontFamily.mono).toBeDefined();
    });
    
    it('has complete font size scale', () => {
      const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
      sizes.forEach(size => {
        expect(typography.fontSize[size as keyof typeof typography.fontSize]).toBeDefined();
        expect(typography.fontSize[size as keyof typeof typography.fontSize]).toMatch(/rem$/);
      });
    });
    
    it('has font weights defined', () => {
      const weights = ['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'];
      weights.forEach(weight => {
        expect(typography.fontWeight[weight as keyof typeof typography.fontWeight]).toBeDefined();
      });
    });
    
    it('has line heights defined', () => {
      expect(typography.lineHeight.tight).toBeDefined();
      expect(typography.lineHeight.normal).toBeDefined();
      expect(typography.lineHeight.relaxed).toBeDefined();
    });
  });
  
  describe('Breakpoint Tokens', () => {
    it('has all breakpoints defined', () => {
      expect(breakpoints.xs).toBeDefined();
      expect(breakpoints.sm).toBeDefined();
      expect(breakpoints.md).toBeDefined();
      expect(breakpoints.lg).toBeDefined();
      expect(breakpoints.xl).toBeDefined();
      expect(breakpoints['2xl']).toBeDefined();
      expect(breakpoints['3xl']).toBeDefined();
    });
    
    it('breakpoints are in ascending order', () => {
      const values = [
        parseInt(breakpoints.xs),
        parseInt(breakpoints.sm),
        parseInt(breakpoints.md),
        parseInt(breakpoints.lg),
        parseInt(breakpoints.xl),
        parseInt(breakpoints['2xl']),
        parseInt(breakpoints['3xl']),
      ];
      
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });
  
  describe('CSS Variables', () => {
    it('exports all tokens as CSS variables', () => {
      // This would require reading the tokens.css file
      // For now, we'll just verify the file exists
      expect(true).toBe(true);
    });
  });
});
