/**
 * GVTEWAY Design System
 * Central export for all design system components, tokens, utilities, hooks, and providers
 * Following Atomic Design Principles:
 * - Atoms: Basic building blocks (buttons, inputs, icons)
 * - Molecules: Simple combinations of atoms (form fields, cards)
 * - Organisms: Complex UI components (navigation, grids, forms)
 * - Templates: Page-level layouts
 * 
 * @example
 * import { Button, Input, tokens } from '@/design-system';
 */

// Export all components (Atomic Design)
export * from './components/atoms';
export * from './components/molecules';
export * from './components/organisms';
export * from './components/templates';

// Export design tokens
export * from './tokens';
export { default as tokens } from './tokens';

// Export hooks
export * from './hooks';

// Export providers
export { ThemeProvider, useThemeContext } from './providers/ThemeProvider';

// Export utils
export { 
  getResponsiveValue, 
  useMediaQuery
} from './utils';
