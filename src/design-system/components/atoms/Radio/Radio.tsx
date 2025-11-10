/**
 * Radio Component
 * GHXSTSHIP Entertainment Platform - Geometric radio buttons
 * Bold outlined radios, geometric selection indicator
 */

import * as React from 'react';
import styles from './Radio.module.css';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
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
    const radioId = id || `radio-${generatedId}`;
    const errorId = error ? `${radioId}-error` : undefined;
    const helperId = helperText ? `${radioId}-helper` : undefined;

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const radioClassNames = [
      styles.radio,
      styles[size],
      error && styles.error,
      disabled && styles.disabled,
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClassNames}>
        <div className={styles.radioWrapper}>
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className={radioClassNames}
            disabled={disabled}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            {...props}
          />
          
          {label && (
            <label htmlFor={radioId} className={styles.label}>
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

Radio.displayName = 'Radio';
