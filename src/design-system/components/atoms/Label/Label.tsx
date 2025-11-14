/**
 * Label - Form label atom
 * GHXSTSHIP Atomic Design System
 */

import { LabelHTMLAttributes } from 'react';
import styles from './Label.module.css';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Required indicator */
  required?: boolean;
}

export function Label({
  children,
  required,
  className,
  ...props
}: LabelProps) {
  const classNames = [
    styles.label,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classNames} {...props}>
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
}
