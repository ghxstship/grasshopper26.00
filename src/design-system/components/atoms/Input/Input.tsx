/**
 * Input Component
 * GHXSTSHIP Monochromatic Design System
 * Zero tolerance for hardcoded values
 */

import * as React from "react"
import styles from "./Input.module.css"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input variant */
  variant?: 'default' | 'error' | 'success';
  
  /** Input size */
  inputSize?: 'sm' | 'md' | 'lg';
  
  /** Full width input */
  fullWidth?: boolean;
  
  /** Icon before input */
  iconBefore?: React.ReactNode;
  
  /** Icon after input */
  iconAfter?: React.ReactNode;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Label */
  label?: string;
  
  /** Required field indicator */
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      fullWidth = false,
      iconBefore,
      iconAfter,
      error,
      helperText,
      label,
      required,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    
    const containerClassNames = [
      styles.container,
      fullWidth && styles.fullWidth,
      className,
    ].filter(Boolean).join(' ');
    
    const inputClassNames = [
      styles.input,
      styles[variant],
      styles[inputSize],
      iconBefore && styles.withIconBefore,
      iconAfter && styles.withIconAfter,
      error && styles.error,
      disabled && styles.disabled,
    ].filter(Boolean).join(' ');
    
    return (
      <div className={containerClassNames}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-label="required">*</span>}
          </label>
        )}
        
        <div className={styles.inputWrapper}>
          {iconBefore && (
            <span className={styles.iconBefore} aria-hidden="true">
              {iconBefore}
            </span>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClassNames}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            aria-required={required}
            {...props}
          />
          
          {iconAfter && (
            <span className={styles.iconAfter} aria-hidden="true">
              {iconAfter}
            </span>
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

Input.displayName = "Input";
