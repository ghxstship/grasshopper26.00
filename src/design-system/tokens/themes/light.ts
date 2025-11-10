/**
 * Light Theme
 * Default theme configuration
 */

import { semanticColors } from '../semantic/colors';
import { spacing } from '../primitives/spacing';
import { typography } from '../primitives/typography';

export const lightTheme = {
  colors: semanticColors,
  spacing,
  typography,
  
  shadows: {
    xs: '2px 2px 0 #000000',
    sm: '3px 3px 0 #000000',
    base: '4px 4px 0 #000000',
    md: '6px 6px 0 #000000',
    lg: '8px 8px 0 #000000',
    xl: '12px 12px 0 #000000',
    '2xl': '16px 16px 0 #000000',
    inner: 'inset 3px 3px 0 #000000',
    glow: 'none',
    glowStrong: 'none',
  },
  
  borderRadius: {
    none: '0',
    sm: '0',
    base: '0',
    md: '0',
    lg: '0',
    xl: '0',
    '2xl': '0',
    '3xl': '0',
    full: '0',
  },
  
  borderWidth: {
    0: '0',
    default: '3px',
    2: '2px',
    3: '3px',
    4: '4px',
    8: '8px',
  },
  
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },
  
  transitions: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
} as const;

export type Theme = typeof lightTheme;
