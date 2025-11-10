/**
 * Primitive Color Tokens - Entertainment Platform
 * Monochromatic palette: Pure black, white, and greyscale only
 * Base color palette - do not use directly in components
 * Use semantic tokens instead for better maintainability
 */

export const primitiveColors = {
  // Base colors
  black: '#000000',
  white: '#FFFFFF',
  
  // Greyscale palette - Entertainment Platform specification
  grey: {
    100: '#F5F5F5',  // Lightest grey, subtle backgrounds
    200: '#E5E5E5',  // Light grey, borders, dividers
    300: '#D4D4D4',  // Mid-light grey
    400: '#A3A3A3',  // Medium grey, secondary text
    500: '#737373',  // Mid grey
    600: '#525252',  // Mid-dark grey
    700: '#404040',  // Dark grey
    800: '#262626',  // Darker grey
    900: '#171717',  // Almost black, deep backgrounds
  },
  
  // Neutral scale (0-950) - mapped to greyscale
  neutral: {
    0: '#FFFFFF',
    50: '#F5F5F5',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#000000',
  },
  
  // Brand colors (Black only)
  brand: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#000000',    // Primary black
    600: '#000000',
    700: '#000000',
    800: '#171717',
    900: '#000000',
    950: '#000000',
  },
  
  // Accent colors (White only)
  accent: {
    50: '#FFFFFF',
    100: '#FFFFFF',
    200: '#F5F5F5',
    300: '#E5E5E5',
    400: '#D4D4D4',
    500: '#FFFFFF',    // Primary white
    600: '#F5F5F5',
    700: '#E5E5E5',
    800: '#D4D4D4',
    900: '#A3A3A3',
    950: '#737373',
  },
  
  // Semantic color bases (Monochromatic only - use icons/text to differentiate)
  success: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#171717',
    900: '#000000',
    950: '#000000',
  },
  
  error: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#171717',
    900: '#000000',
    950: '#000000',
  },
  
  warning: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#171717',
    900: '#000000',
    950: '#000000',
  },
  
  info: {
    50: '#F5F5F5',
    100: '#E5E5E5',
    200: '#D4D4D4',
    300: '#A3A3A3',
    400: '#737373',
    500: '#000000',
    600: '#000000',
    700: '#000000',
    800: '#171717',
    900: '#000000',
    950: '#000000',
  },
} as const;

// Type safety for token access
export type PrimitiveColor = typeof primitiveColors;
