/**
 * Button Component
 * GHXSTSHIP Entertainment Platform - Primary CTA buttons
 * BEBAS NEUE text, thick borders, color inversion hover, geometric arrows
 */

import * as React from "react"
import styles from "./Button.module.css"

export type ButtonVariant = 'filled' | 'outlined' | 'ghost' | 'danger' | 'cta';
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
  'aria-label'?: string;
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
    
    if (isIconOnly && !ariaLabel && !props['aria-labelledby']) {
      console.warn('Button: icon-only buttons require an aria-label or aria-labelledby');
    }
    
    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      isIconOnly && styles.iconOnly,
      loading && styles.loading,
      className,
    ].filter(Boolean).join(' ');
    
    // If asChild is true, clone the child element and merge props
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
        aria-label={ariaLabel}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className={styles.loadingSpinner} aria-hidden="true">
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
)

Button.displayName = "Button"
