/**
 * Chip Component
 * GHXSTSHIP Entertainment Platform - Genre/tag chips
 * Geometric chips for filtering and categorization
 */

import * as React from 'react';
import styles from './Chip.module.css';

export type ChipVariant = 'default' | 'outlined' | 'filled';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  selected?: boolean;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      variant = 'default',
      size = 'md',
      selected = false,
      onDelete,
      onClick,
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.chip,
      styles[variant],
      styles[size],
      selected && styles.selected,
      onClick && styles.clickable,
      className,
    ].filter(Boolean).join(' ');

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete();
      }
    };

    return (
      <div
        ref={ref}
        className={classNames}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-pressed={onClick ? selected : undefined}
      >
        <span className={styles.label}>{label}</span>
        {onDelete && (
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            aria-label={`Remove ${label}`}
            type="button"
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';
