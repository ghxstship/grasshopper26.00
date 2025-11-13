/**
 * Theme Toggle Component
 * Switch between light and dark themes
 */

'use client';

import * as React from 'react';
import { useThemeContext } from '../../../providers/ThemeProvider';
import styles from './ThemeToggle.module.css';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${styles.toggle} ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className={styles.icon} aria-hidden="true">
        {theme === 'light' ? '◐' : '◑'}
      </span>
    </button>
  );
};

ThemeToggle.displayName = 'ThemeToggle';
