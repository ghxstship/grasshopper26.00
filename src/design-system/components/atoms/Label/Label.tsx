/**
 * Label Component
 * GHXSTSHIP Entertainment Platform - Form labels
 * BEBAS NEUE uppercase labels with geometric styling
 */

import * as React from 'react'
import styles from './Label.module.css'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, disabled, size = 'md', className = '', children, ...props }, ref) => {
    const classNames = [
      styles.label,
      styles[size],
      disabled && styles.disabled,
      className,
    ].filter(Boolean).join(' ')

    return (
      <label ref={ref} className={classNames} {...props}>
        {children}
        {required && <span className={styles.required} aria-label="required">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'
