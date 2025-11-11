import Link from 'next/link';
import type { Budget } from '@/types/super-expansion';
import styles from './BudgetCard.module.css';

interface BudgetCardProps {
  budget: Budget;
  href?: string;
}

export function BudgetCard({ budget, href }: BudgetCardProps) {
  const variance = budget.total_profit_actual - budget.total_profit_budgeted;
  const variancePercent = budget.total_profit_budgeted !== 0
    ? ((variance / budget.total_profit_budgeted) * 100).toFixed(1)
    : '0';

  const content = (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>{budget.budget_name}</h3>
        <span className={`${styles.status} ${styles[budget.budget_status]}`}>
          {budget.budget_status.toUpperCase().replace('_', ' ')}
        </span>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.label}>BUDGETED PROFIT</span>
          <span className={styles.value}>
            ${budget.total_profit_budgeted.toLocaleString()}
          </span>
        </div>

        <div className={styles.metric}>
          <span className={styles.label}>ACTUAL PROFIT</span>
          <span className={styles.value}>
            ${budget.total_profit_actual.toLocaleString()}
          </span>
        </div>

        <div className={styles.metric}>
          <span className={styles.label}>VARIANCE</span>
          <span className={`${styles.value} ${variance >= 0 ? styles.positive : styles.negative}`}>
            {variance >= 0 ? '+' : ''}${variance.toLocaleString()} ({variancePercent}%)
          </span>
        </div>
      </div>

      <div className={styles.breakdown}>
        <div className={styles.breakdownItem}>
          <span className={styles.breakdownLabel}>REVENUE</span>
          <span className={styles.breakdownValue}>
            ${budget.total_revenue_actual.toLocaleString()} / ${budget.total_revenue_budgeted.toLocaleString()}
          </span>
        </div>
        <div className={styles.breakdownItem}>
          <span className={styles.breakdownLabel}>EXPENSES</span>
          <span className={styles.breakdownValue}>
            ${budget.total_expenses_actual.toLocaleString()} / ${budget.total_expenses_budgeted.toLocaleString()}
          </span>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles.card}>
        {content}
      </Link>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
