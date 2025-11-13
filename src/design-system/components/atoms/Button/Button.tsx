/**
 * Button Component
 * GHXSTSHIP - Primary interactive element
 */

import * as React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'filled' | 'outlined' | 'ghost' | 'cta';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  iconOnly?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      size = 'md',
      fullWidth = false,
      loading = false,
      iconBefore,
      iconAfter,
      iconOnly,
      asChild = false,
      children,
      className = '',
      disabled,
      type = 'button',
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const isIconOnly = Boolean(iconOnly);
    const isDisabled = disabled || loading;
    
    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      isIconOnly && styles.iconOnly,
      loading && styles.loading,
      className,
    ].filter(Boolean).join(' ');
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        className: `${classNames} ${(children.props as any).className || ''}`.trim(),
        ref,
      } as any);
    }
    
    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className={styles.spinner} aria-hidden="true">
            <span className={styles.spinnerBlock} />
          </span>
        )}
        
        {!loading && iconBefore && (
          <span className={styles.iconBefore} aria-hidden="true">
            {iconBefore}
          </span>
        )}
        
        {!loading && iconOnly && (
          <span className={styles.icon} aria-hidden="true">
            {iconOnly}
          </span>
        )}
        
        {!loading && !iconOnly && children && (
          <span className={styles.content}>
            {children}
          </span>
        )}
        
        {!loading && iconAfter && (
          <span className={styles.iconAfter} aria-hidden="true">
            {iconAfter}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
