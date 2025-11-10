/**
 * Primitive Color Tokens
 * Base color palette - do not use directly in components
 * Use semantic tokens instead for better maintainability
 */

export const primitiveColors = {
  // Neutral scale (0-950)
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Brand colors (GHXSTSHIP: BLACK ONLY)
  brand: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#000000',    // Primary black
    600: '#000000',
    700: '#000000',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Accent colors (GHXSTSHIP: WHITE ONLY)
  accent: {
    50: '#FFFFFF',
    100: '#F9FAFB',
    200: '#F3F4F6',
    300: '#E5E7EB',
    400: '#D1D5DB',
    500: '#FFFFFF',    // Primary white
    600: '#F9FAFB',
    700: '#F3F4F6',
    800: '#E5E7EB',
    900: '#D1D5DB',
    950: '#9CA3AF',
  },
  
  // Semantic color bases (GHXSTSHIP: MONOCHROMATIC ONLY)
  success: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  
  error: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  
  warning: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  
  info: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
} as const;

// Type safety for token access
export type PrimitiveColor = typeof primitiveColors;
