/**
 * PriceDisplay Component
 * GHXSTSHIP Entertainment Platform - Price Display
 * ANTON for price values with geometric styling
 */

import * as React from 'react';
import styles from './PriceDisplay.module.css';

export interface PriceDisplayProps {
  price: number;
  currency?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlighted';
  showCurrency?: boolean;
  className?: string;
}

export const PriceDisplay = React.forwardRef<HTMLDivElement, PriceDisplayProps>(
  (
    {
      price,
      currency = 'USD',
      label,
      size = 'md',
      variant = 'default',
      showCurrency = true,
      className = '',
    },
    ref
  ) => {
    const formatPrice = (value: number, curr: string) => {
      if (!showCurrency) {
        return value.toFixed(2);
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    };

    const classNames = [
      styles.container,
      styles[size],
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        {label && <span className={styles.label}>{label}</span>}
        <span className={styles.price}>{formatPrice(price, currency)}</span>
      </div>
    );
  }
);

PriceDisplay.displayName = 'PriceDisplay';
