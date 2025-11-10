/**
 * FormField Molecule
 * GHXSTSHIP Monochromatic Design System
 * Combines Label + Input + Helper/Error text
 */

import * as React from "react"
import { Input, type InputProps } from '../../atoms/Input/Input';
import styles from './FormField.module.css';

export interface FormFieldProps extends Omit<InputProps, 'label' | 'error' | 'helperText'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  ...inputProps
}) => {
  return (
    <div className={styles.formField}>
      <Input
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        {...inputProps}
      />
    </div>
  );
};
