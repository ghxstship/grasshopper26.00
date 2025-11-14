/**
 * BudgetSummary - Budget summary display molecule
 * GHXSTSHIP Atomic Design System
 */

import { Card, Heading, Text, Stack } from '../../atoms';
import styles from './BudgetSummary.module.css';

export interface BudgetSummaryProps {
  budget: {
    id: string;
    budget_name: string;
    total_budget: number;
    spent_amount?: number;
    remaining_amount?: number;
  };
  showVariance?: boolean;
}

export function BudgetSummary({ budget, showVariance }: BudgetSummaryProps) {
  const spent = budget.spent_amount || 0;
  const remaining = budget.remaining_amount || (budget.total_budget - spent);
  const percentSpent = (spent / budget.total_budget) * 100;

  return (
    <Card>
      <Stack gap={4}>
        <Heading level={3}>{budget.budget_name}</Heading>
        <Stack gap={2}>
          <div className={styles.row}>
            <Text size="sm" color="secondary">Total Budget</Text>
            <Text weight="medium">${(budget.total_budget / 100).toLocaleString()}</Text>
          </div>
          <div className={styles.row}>
            <Text size="sm" color="secondary">Spent</Text>
            <Text weight="medium">${(spent / 100).toLocaleString()}</Text>
          </div>
          <div className={styles.row}>
            <Text size="sm" color="secondary">Remaining</Text>
            <Text weight="medium">${(remaining / 100).toLocaleString()}</Text>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ inlineSize: `${percentSpent}%` }}
            />
          </div>
        </Stack>
      </Stack>
    </Card>
  );
}
