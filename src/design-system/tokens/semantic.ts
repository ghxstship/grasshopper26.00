/**
 * Design System - Semantic Tokens
 * Application layer - purpose-driven assignments
 */

import { primitives } from './primitives';

export const semantic = {
  color: {
    text: {
      primary: primitives.color.black,
      secondary: primitives.color.grey[600],
      tertiary: primitives.color.grey[500],
      disabled: primitives.color.grey[400],
      inverse: primitives.color.white,
    },
    bg: {
      primary: primitives.color.white,
      secondary: primitives.color.grey[50],
      tertiary: primitives.color.grey[100],
      inverse: primitives.color.black,
    },
    border: {
      default: primitives.color.grey[200],
      strong: primitives.color.black,
      subtle: primitives.color.grey[100],
      focus: primitives.color.black,
    },
    interactive: {
      default: primitives.color.black,
      hover: primitives.color.grey[900],
      active: primitives.color.black,
      disabled: primitives.color.grey[300],
    },
  },
  
  spacing: {
    button: {
      sm: primitives.spacing[2],
      md: primitives.spacing[3],
      lg: primitives.spacing[4],
    },
    input: {
      sm: primitives.spacing[2],
      md: primitives.spacing[3],
      lg: primitives.spacing[4],
    },
    card: {
      sm: primitives.spacing[4],
      md: primitives.spacing[6],
      lg: primitives.spacing[8],
    },
  },
  
  typography: {
    hero: {
      fontFamily: primitives.typography.fontFamily.anton,
      fontSize: primitives.typography.fontSize['9xl'],
      lineHeight: primitives.typography.lineHeight.none,
      letterSpacing: primitives.typography.letterSpacing.tight,
    },
    h1: {
      fontFamily: primitives.typography.fontFamily.anton,
      fontSize: primitives.typography.fontSize['8xl'],
      lineHeight: primitives.typography.lineHeight.tight,
      letterSpacing: primitives.typography.letterSpacing.tight,
    },
    h2: {
      fontFamily: primitives.typography.fontFamily.bebas,
      fontSize: primitives.typography.fontSize['7xl'],
      lineHeight: primitives.typography.lineHeight.tight,
      letterSpacing: primitives.typography.letterSpacing.wide,
    },
    h3: {
      fontFamily: primitives.typography.fontFamily.bebas,
      fontSize: primitives.typography.fontSize['6xl'],
      lineHeight: primitives.typography.lineHeight.snug,
      letterSpacing: primitives.typography.letterSpacing.wide,
    },
    h4: {
      fontFamily: primitives.typography.fontFamily.bebas,
      fontSize: primitives.typography.fontSize['5xl'],
      lineHeight: primitives.typography.lineHeight.snug,
      letterSpacing: primitives.typography.letterSpacing.wider,
    },
    h5: {
      fontFamily: primitives.typography.fontFamily.bebas,
      fontSize: primitives.typography.fontSize['4xl'],
      lineHeight: primitives.typography.lineHeight.snug,
      letterSpacing: primitives.typography.letterSpacing.wider,
    },
    h6: {
      fontFamily: primitives.typography.fontFamily.bebas,
      fontSize: primitives.typography.fontSize['3xl'],
      lineHeight: primitives.typography.lineHeight.snug,
      letterSpacing: primitives.typography.letterSpacing.wider,
    },
    body: {
      fontFamily: primitives.typography.fontFamily.share,
      fontSize: primitives.typography.fontSize.base,
      lineHeight: primitives.typography.lineHeight.normal,
    },
    meta: {
      fontFamily: primitives.typography.fontFamily.shareMono,
      fontSize: primitives.typography.fontSize.sm,
      lineHeight: primitives.typography.lineHeight.normal,
      letterSpacing: primitives.typography.letterSpacing.widest,
    },
  },
} as const;

export type Semantic = typeof semantic;
