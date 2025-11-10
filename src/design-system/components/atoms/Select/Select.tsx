/**
 * Select Component
 * GHXSTSHIP Entertainment Platform - Geometric select dropdown
 * Bold outlined selects, BEBAS NEUE labels
 */

import * as React from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  selectSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      helperText,
      selectSize = 'md',
      fullWidth = false,
      placeholder,
      className = '',
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || `select-${generatedId}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    const containerClassNames = [
      styles.container,
      fullWidth && styles.fullWidth,
      className,
    ].filter(Boolean).join(' ');

    const selectClassNames = [
      styles.select,
      styles[selectSize],
      error && styles.error,
      disabled && styles.disabled,
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClassNames}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-label="required">*</span>}
          </label>
        )}

        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            className={selectClassNames}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            aria-required={required}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className={styles.arrow} aria-hidden="true">
            ▼
          </div>
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

Select.displayName = 'Select';

// Compound component exports for compatibility with Radix-style usage
export const SelectTrigger = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props}>{children}</button>
);

export const SelectValue = ({ placeholder, ...props }: { placeholder?: string } & React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{placeholder}</span>
);

export const SelectContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const SelectItem = ({ children, value, ...props }: { value: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div data-value={value} {...props}>{children}</div>
);

SelectTrigger.displayName = 'SelectTrigger';
SelectValue.displayName = 'SelectValue';
SelectContent.displayName = 'SelectContent';
SelectItem.displayName = 'SelectItem';
