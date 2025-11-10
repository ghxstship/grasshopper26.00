/**
 * CTAButton Component
 * GHXSTSHIP Entertainment Platform - Call-to-Action Button
 * BEBAS NEUE text, outlined or filled, with geometric arrow icons
 */

import * as React from 'react';
import styles from './CTAButton.module.css';

export interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showArrow?: boolean;
  children: React.ReactNode;
}

export const CTAButton = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  (
    {
      variant = 'filled',
      size = 'md',
      fullWidth = false,
      showArrow = true,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled}
        {...props}
      >
        <span className={styles.label}>{children}</span>
        {showArrow && (
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        )}
      </button>
    );
  }
);

CTAButton.displayName = 'CTAButton';
