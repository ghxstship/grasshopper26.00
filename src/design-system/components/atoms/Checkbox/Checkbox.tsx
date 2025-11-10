/**
 * Checkbox Component
 * GHXSTSHIP Entertainment Platform - Geometric checkbox
 * Bold outlined inputs, geometric icons for validation
 */

import * as React from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
    const checkboxId = id || `checkbox-${generatedId}`;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const helperId = helperText ? `${checkboxId}-helper` : undefined;

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const checkboxClassNames = [
      styles.checkbox,
      styles[size],
      error && styles.error,
      disabled && styles.disabled,
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClassNames}>
        <div className={styles.checkboxWrapper}>
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={checkboxClassNames}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            {...props}
          />
          
          {label && (
            <label htmlFor={checkboxId} className={styles.label}>
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

Checkbox.displayName = 'Checkbox';
