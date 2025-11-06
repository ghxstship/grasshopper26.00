/**
 * Semantic Color Tokens
 * Purpose-driven color assignments
 * Components should ONLY use these, never primitive colors
 */

import { primitiveColors } from '../primitives/colors';

export const semanticColors = {
  // Interactive elements
  interactive: {
    primary: {
      default: primitiveColors.brand[600],
      hover: primitiveColors.brand[700],
      active: primitiveColors.brand[800],
      disabled: primitiveColors.neutral[300],
      subtle: primitiveColors.brand[50],
    },
    secondary: {
      default: primitiveColors.neutral[600],
      hover: primitiveColors.neutral[700],
      active: primitiveColors.neutral[800],
      disabled: primitiveColors.neutral[300],
      subtle: primitiveColors.neutral[50],
    },
    accent: {
      default: primitiveColors.accent[500],
      hover: primitiveColors.accent[600],
      active: primitiveColors.accent[700],
      disabled: primitiveColors.neutral[300],
      subtle: primitiveColors.accent[50],
    },
  },
  
  // Status indicators
  status: {
    success: {
      default: primitiveColors.success[500],
      bg: primitiveColors.success[50],
      bgStrong: primitiveColors.success[100],
      border: primitiveColors.success[300],
      text: primitiveColors.success[700],
    },
    error: {
      default: primitiveColors.error[500],
      bg: primitiveColors.error[50],
      bgStrong: primitiveColors.error[100],
      border: primitiveColors.error[300],
      text: primitiveColors.error[700],
    },
    warning: {
      default: primitiveColors.warning[500],
      bg: primitiveColors.warning[50],
      bgStrong: primitiveColors.warning[100],
      border: primitiveColors.warning[300],
      text: primitiveColors.warning[700],
    },
    info: {
      default: primitiveColors.info[500],
      bg: primitiveColors.info[50],
      bgStrong: primitiveColors.info[100],
      border: primitiveColors.info[300],
      text: primitiveColors.info[700],
    },
  },
  
  // Text colors
  text: {
    primary: primitiveColors.neutral[900],
    secondary: primitiveColors.neutral[600],
    tertiary: primitiveColors.neutral[500],
    disabled: primitiveColors.neutral[400],
    inverse: primitiveColors.neutral[0],
    brand: primitiveColors.brand[600],
    accent: primitiveColors.accent[500],
    success: primitiveColors.success[700],
    error: primitiveColors.error[700],
    warning: primitiveColors.warning[700],
    info: primitiveColors.info[700],
  },
  
  // Surface colors
  surface: {
    primary: primitiveColors.neutral[0],
    secondary: primitiveColors.neutral[50],
    tertiary: primitiveColors.neutral[100],
    raised: primitiveColors.neutral[0],
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayStrong: 'rgba(0, 0, 0, 0.7)',
    brand: primitiveColors.brand[50],
    accent: primitiveColors.accent[50],
  },
  
  // Border colors
  border: {
    default: primitiveColors.neutral[200],
    strong: primitiveColors.neutral[300],
    subtle: primitiveColors.neutral[100],
    brand: primitiveColors.brand[500],
    accent: primitiveColors.accent[500],
    focus: primitiveColors.brand[500],
    error: primitiveColors.error[500],
    success: primitiveColors.success[500],
  },
  
  // Gradient definitions
  gradients: {
    brandPrimary: `linear-gradient(135deg, ${primitiveColors.brand[600]} 0%, ${primitiveColors.accent[500]} 100%)`,
    brandSubtle: `linear-gradient(135deg, ${primitiveColors.brand[50]} 0%, ${primitiveColors.accent[50]} 100%)`,
    brandDark: `linear-gradient(135deg, ${primitiveColors.brand[900]} 0%, ${primitiveColors.accent[900]} 100%)`,
    heroBackground: `linear-gradient(to bottom right, ${primitiveColors.brand[900]}, ${primitiveColors.neutral[950]}, ${primitiveColors.info[900]})`,
  },
} as const;

export type SemanticColors = typeof semanticColors;
