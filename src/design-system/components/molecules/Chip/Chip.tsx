/**
 * Chip Component
 * GHXSTSHIP Entertainment Platform - Chip/Tag
 * Geometric chips for categories, tags, filters
 */

import * as React from 'react';
import styles from './Chip.module.css';

export interface ChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      onRemove,
      variant = 'default',
      size = 'md',
      icon,
      disabled = false,
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.chip,
      styles[variant],
      styles[size],
      disabled && styles.disabled,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.label}>{label}</span>
        {onRemove && !disabled && (
          <button
            className={styles.removeButton}
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            type="button"
          >
            <span className={styles.removeIcon} aria-hidden="true">
              ✕
            </span>
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';
