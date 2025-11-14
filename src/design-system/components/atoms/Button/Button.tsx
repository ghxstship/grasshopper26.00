/**
 * Button - Interactive primitive
 * GHXSTSHIP Atomic Design System
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Children content */
  children: ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'filled' | 'outlined';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Render as child (for Link compatibility) */
  asChild?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  disabled,
  asChild,
  className,
  ...props
}: ButtonProps) {
  // Map filled/outlined to primary/secondary for compatibility
  const mappedVariant = variant === 'filled' ? 'primary' : variant === 'outlined' ? 'secondary' : variant;
  
  const classNames = [
    styles.button,
    styles[`variant-${mappedVariant}`],
    styles[`size-${size}`],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // If asChild, render children directly (for Link compatibility)
  if (asChild) {
    return children as React.ReactElement;
  }

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
