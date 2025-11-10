/**
 * Dark Theme
 * Dark mode configuration with adjusted colors for better contrast
 */

import { primitiveColors } from '../primitives/colors';
import { spacing } from '../primitives/spacing';
import { typography } from '../primitives/typography';
import { lightTheme } from './light';

export const darkTheme = {
  ...lightTheme,
  
  colors: {
    ...lightTheme.colors,
    
    // Override text colors for dark mode
    text: {
      primary: primitiveColors.neutral[50],
      secondary: primitiveColors.neutral[300],
      tertiary: primitiveColors.neutral[400],
      disabled: primitiveColors.neutral[600],
      inverse: primitiveColors.neutral[900],
      brand: primitiveColors.brand[400],
      accent: primitiveColors.accent[400],
      success: primitiveColors.success[400],
      error: primitiveColors.error[400],
      warning: primitiveColors.warning[400],
      info: primitiveColors.info[400],
    },
    
    // Override surface colors for dark mode
    surface: {
      primary: primitiveColors.neutral[900],
      secondary: primitiveColors.neutral[800],
      tertiary: primitiveColors.neutral[700],
      raised: primitiveColors.neutral[800],
      overlay: 'rgba(0, 0, 0, 0.7)',
      overlayLight: 'rgba(0, 0, 0, 0.5)',
      overlayStrong: 'rgba(0, 0, 0, 0.9)',
      brand: primitiveColors.brand[950],
      accent: primitiveColors.accent[950],
    },
    
    // Override border colors for dark mode
    border: {
      default: primitiveColors.neutral[700],
      strong: primitiveColors.neutral[600],
      subtle: primitiveColors.neutral[800],
      brand: primitiveColors.brand[500],
      accent: primitiveColors.accent[500],
      focus: primitiveColors.brand[400],
      error: primitiveColors.error[500],
      success: primitiveColors.success[500],
    },
    
    // Override interactive colors for dark mode
    interactive: {
      primary: {
        default: primitiveColors.brand[500],
        hover: primitiveColors.brand[400],
        active: primitiveColors.brand[300],
        disabled: primitiveColors.neutral[700],
        subtle: primitiveColors.brand[950],
      },
      secondary: {
        default: primitiveColors.neutral[400],
        hover: primitiveColors.neutral[300],
        active: primitiveColors.neutral[200],
        disabled: primitiveColors.neutral[700],
        subtle: primitiveColors.neutral[900],
      },
      accent: {
        default: primitiveColors.accent[400],
        hover: primitiveColors.accent[300],
        active: primitiveColors.accent[200],
        disabled: primitiveColors.neutral[700],
        subtle: primitiveColors.accent[950],
      },
    },
  },
  
  // Adjusted shadows for dark mode (GHXSTSHIP: Hard geometric only)
  shadows: {
    ...lightTheme.shadows,
    xs: '2px 2px 0 #FFFFFF',
    sm: '3px 3px 0 #FFFFFF',
    base: '4px 4px 0 #FFFFFF',
    md: '6px 6px 0 #FFFFFF',
    lg: '8px 8px 0 #FFFFFF',
    xl: '12px 12px 0 #FFFFFF',
    '2xl': '16px 16px 0 #FFFFFF',
    glow: 'none',
    glowStrong: 'none',
  },
} as const;

export type DarkTheme = typeof darkTheme;
