/**
 * PriceDisplay Component
 * GHXSTSHIP Entertainment Platform - Ticket pricing display
 * BEBAS NEUE numbers with geometric layout
 */

import * as React from 'react';
import styles from './PriceDisplay.module.css';

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';
export type PriceVariant = 'default' | 'strikethrough' | 'range';

export interface PriceDisplayProps {
  amount: number;
  originalAmount?: number;
  currency?: string;
  size?: PriceSize;
  variant?: PriceVariant;
  showCurrency?: boolean;
  className?: string;
}

export const PriceDisplay = React.forwardRef<HTMLDivElement, PriceDisplayProps>(
  (
    {
      amount,
      originalAmount,
      currency = 'USD',
      size = 'md',
      variant = 'default',
      showCurrency = true,
      className = '',
    },
    ref
  ) => {
    const formatPrice = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    };

    const containerClassNames = [
      styles.container,
      styles[size],
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        {originalAmount && originalAmount > amount && (
          <span className={styles.original}>
            {formatPrice(originalAmount)}
          </span>
        )}
        <span className={styles.amount}>
          {showCurrency ? formatPrice(amount) : amount.toFixed(2)}
        </span>
      </div>
    );
  }
);

PriceDisplay.displayName = 'PriceDisplay';
