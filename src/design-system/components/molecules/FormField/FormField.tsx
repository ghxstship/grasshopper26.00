/**
 * FormField - Form field with label and error molecule
 * GHXSTSHIP Atomic Design System
 */

import { Input, Stack, Text } from '../../atoms';
import type { InputProps } from '../../atoms';
import styles from './FormField.module.css';

export interface FormFieldProps extends InputProps {
  /** Field label */
  label: string;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Required field */
  required?: boolean;
}

export function FormField({
  label,
  errorMessage,
  helperText,
  required,
  id,
  ...inputProps
}: FormFieldProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = Boolean(errorMessage);

  return (
    <Stack gap={2} className={styles.formField}>
      <label htmlFor={fieldId} className={styles.label}>
        <Text font="bebas" size="lg" uppercase>
          {label}
          {required && <span className={styles.required}>*</span>}
        </Text>
      </label>

      <Input
        id={fieldId}
        error={hasError}
        aria-invalid={hasError}
        aria-describedby={errorMessage ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        {...inputProps}
      />

      {errorMessage && (
        <Text id={`${fieldId}-error`} size="sm" color="primary" className={styles.error}>
          {errorMessage}
        </Text>
      )}

      {helperText && !errorMessage && (
        <Text id={`${fieldId}-helper`} size="sm" color="tertiary">
          {helperText}
        </Text>
      )}
    </Stack>
  );
}
