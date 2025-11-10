/**
 * FormField Component
 * GHXSTSHIP Entertainment Platform - Complete form field wrapper
 * Combines label, input, error, and helper text
 */

import * as React from 'react'
import styles from './FormField.module.css'

export interface FormFieldProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  children: React.ReactElement
  className?: string
  id?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  children,
  className = '',
  id,
}) => {
  const generatedId = React.useId()
  const fieldId = id || `field-${generatedId}`
  const errorId = error ? `${fieldId}-error` : undefined
  const helperId = helperText ? `${fieldId}-helper` : undefined

  const childWithProps = React.cloneElement(children, {
    id: fieldId,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': [errorId, helperId].filter(Boolean).join(' ') || undefined,
    'aria-required': required,
  })

  return (
    <div className={`${styles.formField} ${className}`}>
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}
      
      {childWithProps}
      
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
      
      {helperText && !error && (
        <span id={helperId} className={styles.helper}>
          {helperText}
        </span>
      )}
    </div>
  )
}

FormField.displayName = 'FormField'
