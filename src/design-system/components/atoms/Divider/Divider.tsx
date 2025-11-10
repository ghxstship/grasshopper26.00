/**
 * Divider Component
 * GHXSTSHIP Entertainment Platform - Thick geometric dividers
 * 3px borders, horizontal/vertical orientation
 */

import * as React from 'react';
import styles from './Divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerThickness = 'thin' | 'default' | 'thick';

export interface DividerProps {
  orientation?: DividerOrientation;
  thickness?: DividerThickness;
  className?: string;
  'aria-hidden'?: boolean;
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      thickness = 'default',
      className = '',
      'aria-hidden': ariaHidden = true,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.divider,
      styles[orientation],
      styles[thickness],
      className,
    ].filter(Boolean).join(' ');

    return (
      <hr
        ref={ref}
        className={classNames}
        aria-hidden={ariaHidden}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
