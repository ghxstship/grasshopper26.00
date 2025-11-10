/**
 * StageLabel Component
 * GHXSTSHIP Entertainment Platform - Festival stage indicator
 * BEBAS NEUE stage names with geometric styling
 */

import * as React from 'react';
import styles from './StageLabel.module.css';

export type StageLabelSize = 'sm' | 'md' | 'lg';
export type StageLabelVariant = 'default' | 'primary' | 'outlined';

export interface StageLabelProps {
  name: string;
  variant?: StageLabelVariant;
  size?: StageLabelSize;
  className?: string;
}

export const StageLabel = React.forwardRef<HTMLSpanElement, StageLabelProps>(
  (
    {
      name,
      variant = 'default',
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.label,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classNames}>
        {name}
      </span>
    );
  }
);

StageLabel.displayName = 'StageLabel';
