'use client';

import React from 'react';
import styles from './BudgetDisplay.module.css';

export interface BudgetDisplayProps {
  label: string;
  amount: number;
  type?: 'revenue' | 'expense' | 'profit';
  currency?: string;
  showVariance?: boolean;
  variance?: number;
  className?: string;
}

export const BudgetDisplay: React.FC<BudgetDisplayProps> = ({
  label,
  amount,
  type = 'expense',
  currency = 'USD',
  showVariance = false,
  variance = 0,
  className,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const variancePercentage = amount !== 0 ? ((variance / amount) * 100).toFixed(1) : '0.0';
  const isPositiveVariance = variance > 0;

  return (
    <div className={`${styles.container} ${styles[type]} ${className || ''}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.amount}>{formatCurrency(amount)}</div>
      {showVariance && (
        <div className={`${styles.variance} ${isPositiveVariance ? styles.positive : styles.negative}`}>
          {isPositiveVariance ? '+' : ''}{formatCurrency(variance)} ({variancePercentage}%)
        </div>
      )}
    </div>
  );
};

BudgetDisplay.displayName = 'BudgetDisplay';
