/**
 * Semantic Color Tokens - Entertainment Platform
 * Purpose-driven color assignments - monochromatic only
 * Components should ONLY use these, never primitive colors
 */

import { primitiveColors } from '../primitives/colors';

export const semanticColors = {
  // Interactive elements - Entertainment Platform (black/white/grey)
  interactive: {
    primary: {
      default: primitiveColors.black,
      hover: primitiveColors.grey[900],
      active: primitiveColors.black,
      disabled: primitiveColors.grey[300],
      subtle: primitiveColors.grey[100],
    },
    secondary: {
      default: primitiveColors.grey[600],
      hover: primitiveColors.grey[700],
      active: primitiveColors.grey[800],
      disabled: primitiveColors.grey[300],
      subtle: primitiveColors.grey[100],
    },
    accent: {
      default: primitiveColors.white,
      hover: primitiveColors.grey[100],
      active: primitiveColors.grey[200],
      disabled: primitiveColors.grey[300],
      subtle: primitiveColors.grey[900],
    },
  },
  
  // Status indicators (monochromatic - use icons/text to differentiate)
  status: {
    success: {
      default: primitiveColors.black,
      bg: primitiveColors.grey[100],
      bgStrong: primitiveColors.grey[200],
      border: primitiveColors.black,
      text: primitiveColors.black,
    },
    error: {
      default: primitiveColors.black,
      bg: primitiveColors.grey[100],
      bgStrong: primitiveColors.grey[200],
      border: primitiveColors.black,
      text: primitiveColors.black,
    },
    warning: {
      default: primitiveColors.black,
      bg: primitiveColors.grey[100],
      bgStrong: primitiveColors.grey[200],
      border: primitiveColors.black,
      text: primitiveColors.black,
    },
    info: {
      default: primitiveColors.black,
      bg: primitiveColors.grey[100],
      bgStrong: primitiveColors.grey[200],
      border: primitiveColors.black,
      text: primitiveColors.black,
    },
  },
  
  // Text colors - Entertainment Platform
  text: {
    primary: primitiveColors.black,
    secondary: primitiveColors.grey[600],
    tertiary: primitiveColors.grey[500],
    disabled: primitiveColors.grey[400],
    inverse: primitiveColors.white,
    brand: primitiveColors.black,
    accent: primitiveColors.white,
    meta: primitiveColors.grey[500],
    success: primitiveColors.black,
    error: primitiveColors.black,
    warning: primitiveColors.black,
    info: primitiveColors.black,
  },
  
  // Surface colors - Entertainment Platform
  surface: {
    primary: primitiveColors.white,
    secondary: primitiveColors.grey[100],
    tertiary: primitiveColors.grey[200],
    raised: primitiveColors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayStrong: 'rgba(0, 0, 0, 0.7)',
    brand: primitiveColors.grey[100],
    accent: primitiveColors.grey[900],
    black: primitiveColors.black,
    white: primitiveColors.white,
  },
  
  // Border colors - Entertainment Platform
  border: {
    default: primitiveColors.grey[200],
    strong: primitiveColors.black,
    subtle: primitiveColors.grey[100],
    brand: primitiveColors.black,
    accent: primitiveColors.white,
    focus: primitiveColors.black,
    error: primitiveColors.black,
    success: primitiveColors.black,
  },
  
  // Gradient definitions (Monochromatic only - minimal use)
  gradients: {
    brandPrimary: `linear-gradient(135deg, ${primitiveColors.black} 0%, ${primitiveColors.grey[900]} 100%)`,
    brandSubtle: `linear-gradient(135deg, ${primitiveColors.grey[100]} 0%, ${primitiveColors.white} 100%)`,
    brandDark: `linear-gradient(135deg, ${primitiveColors.black} 0%, ${primitiveColors.grey[900]} 100%)`,
    heroBackground: `linear-gradient(to bottom right, ${primitiveColors.black}, ${primitiveColors.grey[900]}, ${primitiveColors.black})`,
  },
} as const;

export type SemanticColors = typeof semanticColors;
