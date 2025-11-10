/**
 * Toggle Component
 * GHXSTSHIP Entertainment Platform - Geometric toggle switch
 * Bold outlined toggle, geometric slider
 */

import * as React from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const toggleId = id || `toggle-${generatedId}`;
    const errorId = error ? `${toggleId}-error` : undefined;
    const helperId = helperText ? `${toggleId}-helper` : undefined;

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const toggleClassNames = [
      styles.toggle,
      styles[size],
      error && styles.error,
      disabled && styles.disabled,
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClassNames}>
        <div className={styles.toggleWrapper}>
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={toggleId}
            className={toggleClassNames}
            disabled={disabled}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            {...props}
          />
          
          {label && (
            <label htmlFor={toggleId} className={styles.label}>
              {label}
            </label>
          )}
        </div>

        {error && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
