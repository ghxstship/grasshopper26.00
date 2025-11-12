'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Unified theme hook for GVTEWAY
 * Wraps next-themes with GHXSTSHIP-specific functionality
 * 
 * Supports: light, dark, system
 * Uses: CSS custom properties with [data-theme] attribute
 */
export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Cycle through theme options: light → dark → system
   */
  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme as typeof themes[number]);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  /**
   * Get the current effective theme (resolves 'system' to actual theme)
   */
  const effectiveTheme = resolvedTheme || 'dark';

  /**
   * Check if dark mode is active
   */
  const isDark = effectiveTheme === 'dark';

  /**
   * Check if light mode is active
   */
  const isLight = effectiveTheme === 'light';

  /**
   * Check if system preference is being used
   */
  const isSystem = theme === 'system';

  return {
    // Core next-themes API
    theme: theme as 'light' | 'dark' | 'system' | undefined,
    setTheme: (theme: 'light' | 'dark' | 'system') => setTheme(theme),
    systemTheme: systemTheme as 'light' | 'dark' | undefined,
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
    
    // GHXSTSHIP-specific helpers
    cycleTheme,
    effectiveTheme: effectiveTheme as 'light' | 'dark',
    isDark,
    isLight,
    isSystem,
    mounted,
  };
}
