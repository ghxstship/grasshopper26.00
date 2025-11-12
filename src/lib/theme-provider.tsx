'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

/**
 * GVTEWAY Theme Provider
 * Wraps next-themes with GHXSTSHIP design system configuration
 * 
 * Configuration:
 * - attribute: 'data-theme' (matches CSS selectors in tokens.css)
 * - defaultTheme: 'dark' (GHXSTSHIP default)
 * - enableSystem: true (respects OS preference)
 * - storageKey: 'gvteway-theme' (localStorage key)
 * - themes: ['light', 'dark'] (available themes)
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem
      storageKey="gvteway-theme"
      themes={['light', 'dark']}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
