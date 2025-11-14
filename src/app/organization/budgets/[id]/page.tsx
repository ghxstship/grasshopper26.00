import { Suspense } from 'react';
import Link from 'next/link';
import { getBudgetById } from '@/lib/actions/budgets';
import { BudgetSummary } from '@/design-system';
import { Spinner } from '@/design-system';
import styles from './page.module.css';

export const metadata = {
  title: 'Budget Details | GVTEWAY',
  description: 'View and manage budget',
};

interface BudgetPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function BudgetDetails({ id }: { id: string }) {
  const budget = await getBudgetById(id);

  if (!budget) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>BUDGET NOT FOUND</p>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <BudgetSummary budget={budget} showVariance={true} />

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>LINE ITEMS</h2>
          <Link href={`/organization/budgets/${id}/add-item`} className={styles.button}>
            ADD LINE ITEM
          </Link>
        </div>

        {budget.line_items && budget.line_items.length > 0 ? (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>ITEM</div>
              <div className={styles.tableCell}>CATEGORY</div>
              <div className={styles.tableCell}>BUDGETED</div>
              <div className={styles.tableCell}>ACTUAL</div>
              <div className={styles.tableCell}>STATUS</div>
            </div>
            {budget.line_items.map((item: any) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{item.line_item_name}</div>
                <div className={styles.tableCell}>
                  {item.category?.category_name || '-'}
                </div>
                <div className={styles.tableCell}>
                  ${item.budgeted_amount.toLocaleString()}
                </div>
                <div className={styles.tableCell}>
                  ${item.actual_amount.toLocaleString()}
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.status} ${styles[item.line_item_status]}`}>
                    {item.line_item_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptySection}>
            <p className={styles.emptySectionText}>NO LINE ITEMS YET</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const { id } = await params;
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>BUDGET DETAILS</h1>
        <div className={styles.actions}>
          <Link href={`/organization/budgets/${id}/edit`} className={styles.button}>
            EDIT
          </Link>
          <Link href={`/organization/budgets/${id}/approve`} className={styles.button}>
            APPROVE
          </Link>
        </div>
      </div>

      <Suspense fallback={<Spinner />}>
        <BudgetDetails id={id} />
      </Suspense>
    </div>
  );
}
