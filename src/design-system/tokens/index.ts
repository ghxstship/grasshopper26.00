/**
 * Design Tokens Central Export
 * All design tokens for the application
 */

export * from './primitives';
export * from './semantic';
export * from './themes';

// Default export for convenience
import { lightTheme } from './themes/light';
import { darkTheme } from './themes/dark';

export const tokens = {
  light: lightTheme,
  dark: darkTheme,
};

export type Tokens = typeof tokens;
