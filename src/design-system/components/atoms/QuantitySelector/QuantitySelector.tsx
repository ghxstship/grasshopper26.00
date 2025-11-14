/**
 * QuantitySelector - Quantity input with increment/decrement buttons
 * GHXSTSHIP Atomic Design System
 */

import { Minus, Plus } from 'lucide-react';
import styles from './QuantitySelector.module.css';

export interface QuantitySelectorProps {
  /** Current quantity value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max = 999,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
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
    styles.container,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <button
        type="button"
        className={styles.button}
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <input
        type="number"
        className={styles.input}
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Quantity"
      />
      <button
        type="button"
        className={styles.button}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
