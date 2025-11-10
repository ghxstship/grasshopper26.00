import * as React from 'react';
import { MinusIcon, PlusIcon } from '../Icon/Icon';
import styles from './QuantitySelector.module.css';

/**
 * QuantitySelector Component
 * GHXSTSHIP Entertainment Platform - Ticket quantity selector
 * Geometric buttons with thick borders for ticket selection
 */
export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className = '',
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const classNames = [
    styles.selector,
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={styles.button}
        aria-label="Decrease quantity"
      >
        <MinusIcon size="sm" decorative />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={styles.input}
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={styles.button}
        aria-label="Increase quantity"
      >
        <PlusIcon size="sm" decorative />
      </button>
    </div>
  );
};
