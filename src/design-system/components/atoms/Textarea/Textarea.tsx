/**
 * Textarea Component
 * GHXSTSHIP Entertainment Platform - Geometric textarea
 * Bold outlined inputs, BEBAS NEUE labels
 */

import * as React from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  textareaSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      textareaSize = 'md',
      fullWidth = false,
      resize = 'vertical',
      className = '',
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || `textarea-${generatedId}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;

    const containerClassNames = [
      styles.container,
      fullWidth && styles.fullWidth,
      className,
    ].filter(Boolean).join(' ');

    const textareaClassNames = [
      styles.textarea,
      styles[textareaSize],
      styles[`resize-${resize}`],
      error && styles.error,
      disabled && styles.disabled,
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClassNames}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-label="required">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClassNames}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          aria-required={required}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
