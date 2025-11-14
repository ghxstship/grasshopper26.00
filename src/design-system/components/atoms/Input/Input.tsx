/**
 * Input - Form input primitive
 * GHXSTSHIP Atomic Design System
 */

import { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

export function Input({
  size = 'md',
  error,
  fullWidth,
  className,
  ...props
}: InputProps) {
  const classNames = [
    styles.input,
    styles[`size-${size}`],
    error && styles.error,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <input className={classNames} {...props} />;
}
