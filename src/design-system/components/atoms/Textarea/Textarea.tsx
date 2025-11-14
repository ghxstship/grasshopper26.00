/**
 * Textarea - Multi-line text input atom
 * GHXSTSHIP Atomic Design System
 */

import { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Textarea size */
  size?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Resize behavior */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export function Textarea({
  size = 'md',
  error,
  fullWidth,
  resize = 'vertical',
  className,
  ...props
}: TextareaProps) {
  const classNames = [
    styles.textarea,
    styles[`size-${size}`],
    styles[`resize-${resize}`],
    error && styles.error,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <textarea className={classNames} {...props} />;
}
