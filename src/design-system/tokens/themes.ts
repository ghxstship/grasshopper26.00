/**
 * Design System - Theme Configurations
 */

import { primitives } from './primitives';

export const lightTheme = {
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
} as const;

export const darkTheme = {
  text: {
    primary: primitives.color.white,
    secondary: primitives.color.grey[300],
    tertiary: primitives.color.grey[400],
    disabled: primitives.color.grey[600],
    inverse: primitives.color.black,
  },
  bg: {
    primary: primitives.color.black,
    secondary: primitives.color.grey[950],
    tertiary: primitives.color.grey[900],
    inverse: primitives.color.white,
  },
  border: {
    default: primitives.color.grey[800],
    strong: primitives.color.white,
    subtle: primitives.color.grey[900],
    focus: primitives.color.white,
  },
  interactive: {
    default: primitives.color.white,
    hover: primitives.color.grey[100],
    active: primitives.color.white,
    disabled: primitives.color.grey[700],
  },
} as const;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
