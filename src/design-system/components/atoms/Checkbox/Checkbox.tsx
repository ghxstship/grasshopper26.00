/**
 * Checkbox - Checkbox input atom
 * GHXSTSHIP Atomic Design System
 */

import { InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Checkbox label */
  label?: string;
  /** Checkbox size */
  size?: 'sm' | 'md' | 'lg';
}

export function Checkbox({
  label,
  size = 'md',
  className,
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const classNames = [
    styles.wrapper,
    styles[`size-${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <input
        type="checkbox"
        id={checkboxId}
        className={styles.checkbox}
        {...props}
      />
      {label && (
        <label htmlFor={checkboxId} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  );
}
