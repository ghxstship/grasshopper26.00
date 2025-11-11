'use client';

import React from 'react';
import styles from './BudgetSummary.module.css';
import { BudgetDisplay } from '../../atoms/BudgetDisplay';
import type { Budget } from '@/types/super-expansion';

export interface BudgetSummaryProps {
  budget: Budget;
  showVariance?: boolean;
  className?: string;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  budget,
  showVariance = false,
  className,
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{budget.budget_name}</h3>
        <span className={`${styles.status} ${styles[budget.budget_status]}`}>
          {budget.budget_status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className={styles.grid}>
        <BudgetDisplay
          label="REVENUE"
          amount={budget.total_revenue_budgeted}
          type="revenue"
          showVariance={showVariance}
          variance={budget.total_revenue_actual - budget.total_revenue_budgeted}
        />
        
        <BudgetDisplay
          label="EXPENSES"
          amount={budget.total_expenses_budgeted}
          type="expense"
          showVariance={showVariance}
          variance={budget.total_expenses_actual - budget.total_expenses_budgeted}
        />
        
        <BudgetDisplay
          label="PROFIT"
          amount={budget.total_profit_budgeted}
          type="profit"
          showVariance={showVariance}
          variance={budget.total_profit_actual - budget.total_profit_budgeted}
        />
      </div>
    </div>
  );
};

BudgetSummary.displayName = 'BudgetSummary';
