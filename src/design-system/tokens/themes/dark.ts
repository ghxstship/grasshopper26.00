/**
 * Dark Theme - Entertainment Platform
 * Inverted monochromatic palette with hard geometric edges
 */

import { primitiveColors } from '../primitives/colors';
import { spacing } from '../primitives/spacing';
import { typography } from '../primitives/typography';
import { animations } from '../primitives/animations';
import { lightTheme } from './light';

export const darkTheme = {
  ...lightTheme,
  
  colors: {
    ...lightTheme.colors,
    
    // Override text colors for dark mode - Entertainment Platform
    text: {
      primary: primitiveColors.white,
      secondary: primitiveColors.grey[300],
      tertiary: primitiveColors.grey[400],
      disabled: primitiveColors.grey[500],
      inverse: primitiveColors.black,
      brand: primitiveColors.white,
      accent: primitiveColors.white,
      meta: primitiveColors.grey[400],
      success: primitiveColors.white,
      error: primitiveColors.white,
      warning: primitiveColors.white,
      info: primitiveColors.white,
    },
    
    // Override surface colors for dark mode - Entertainment Platform
    surface: {
      primary: primitiveColors.black,
      secondary: primitiveColors.grey[900],
      tertiary: primitiveColors.grey[800],
      raised: primitiveColors.grey[900],
      overlay: 'rgba(255, 255, 255, 0.5)',
      overlayLight: 'rgba(255, 255, 255, 0.3)',
      overlayStrong: 'rgba(255, 255, 255, 0.7)',
      brand: primitiveColors.grey[900],
      accent: primitiveColors.white,
      black: primitiveColors.black,
      white: primitiveColors.white,
    },
    
    // Override border colors for dark mode - Entertainment Platform
    border: {
      default: primitiveColors.grey[800],
      strong: primitiveColors.white,
      subtle: primitiveColors.grey[900],
      brand: primitiveColors.white,
      accent: primitiveColors.white,
      focus: primitiveColors.white,
      error: primitiveColors.white,
      success: primitiveColors.white,
    },
    
    // Override interactive colors for dark mode - Entertainment Platform
    interactive: {
      primary: {
        default: primitiveColors.white,
        hover: primitiveColors.grey[100],
        active: primitiveColors.grey[200],
        disabled: primitiveColors.grey[600],
        subtle: primitiveColors.grey[900],
      },
      secondary: {
        default: primitiveColors.grey[400],
        hover: primitiveColors.grey[300],
        active: primitiveColors.grey[200],
        disabled: primitiveColors.grey[600],
        subtle: primitiveColors.black,
      },
      accent: {
        default: primitiveColors.black,
        hover: primitiveColors.grey[900],
        active: primitiveColors.grey[800],
        disabled: primitiveColors.grey[600],
        subtle: primitiveColors.grey[100],
      },
    },
  },
  
  // Adjusted shadows for dark mode - white on dark backgrounds
  shadows: {
    ...lightTheme.shadows,
    xs: '2px 2px 0 #FFFFFF',
    sm: '3px 3px 0 #FFFFFF',
    base: '4px 4px 0 #FFFFFF',
    md: '6px 6px 0 #FFFFFF',
    lg: '8px 8px 0 #FFFFFF',
    xl: '12px 12px 0 #FFFFFF',
    '2xl': '16px 16px 0 #FFFFFF',
    inner: 'inset 3px 3px 0 #FFFFFF',
    glow: 'none',
    glowStrong: 'none',
    // Black shadows for light elements on dark backgrounds
    whiteSm: '3px 3px 0 #000000',
    whiteMd: '6px 6px 0 #000000',
    whiteLg: '8px 8px 0 #000000',
  },
} as const;

export type DarkTheme = typeof darkTheme;
