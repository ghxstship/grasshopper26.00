/**
 * Separator Component
 * GHXSTSHIP Entertainment Platform - Section separators
 * Geometric dividers with optional text
 */

import * as React from 'react';
import styles from './Separator.module.css';

export type SeparatorOrientation = 'horizontal' | 'vertical';
export type SeparatorVariant = 'solid' | 'dashed' | 'dotted';

export interface SeparatorProps {
  orientation?: SeparatorOrientation;
  variant?: SeparatorVariant;
  text?: string;
  className?: string;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      orientation = 'horizontal',
      variant = 'solid',
      text,
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.separator,
      styles[orientation],
      styles[variant],
      text && styles.withText,
      className,
    ].filter(Boolean).join(' ');

    if (text && orientation === 'horizontal') {
      return (
        <div ref={ref} className={classNames} role="separator">
          <span className={styles.line} />
          <span className={styles.text}>{text}</span>
          <span className={styles.line} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={classNames}
        role="separator"
        aria-orientation={orientation}
      />
    );
  }
);

Separator.displayName = 'Separator';
