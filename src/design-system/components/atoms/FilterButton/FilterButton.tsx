/**
 * FilterButton Component
 * GHXSTSHIP Entertainment Platform - Filter toggle button
 * BEBAS NEUE text with active state indication
 */

import * as React from 'react';
import styles from './FilterButton.module.css';

export type FilterButtonSize = 'sm' | 'md' | 'lg';

export interface FilterButtonProps {
  label: string;
  isActive?: boolean;
  count?: number;
  onClick?: () => void;
  size?: FilterButtonSize;
  disabled?: boolean;
  className?: string;
}

export const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  (
    {
      label,
      isActive = false,
      count,
      onClick,
      size = 'md',
      disabled = false,
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[size],
      isActive && styles.active,
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type="button"
        className={classNames}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={isActive}
      >
        <span className={styles.label}>{label}</span>
        {typeof count === 'number' && (
          <span className={styles.count}>{count}</span>
        )}
      </button>
    );
  }
);

FilterButton.displayName = 'FilterButton';
