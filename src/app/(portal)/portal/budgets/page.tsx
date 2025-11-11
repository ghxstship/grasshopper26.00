import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BudgetCard } from '@/design-system/components/molecules/BudgetCard';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Budgets | GVTEWAY',
  description: 'Manage event budgets',
};

async function BudgetsList() {
  const supabase = await createClient();
  
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select(`
      *,
      event:events(event_name, event_start_date)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!budgets || budgets.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO BUDGETS FOUND</p>
        <Link href="/portal/budgets/new" className={styles.createButton}>
          CREATE BUDGET
        </Link>
      </div>
    );
  }

  const activeBudgets = budgets.filter(b => 
    ['draft', 'pending_approval', 'approved'].includes(b.budget_status)
  );
  
  const lockedBudgets = budgets.filter(b => 
    ['locked', 'closed'].includes(b.budget_status)
  );

  return (
    <div className={styles.content}>
      {activeBudgets.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>ACTIVE ({activeBudgets.length})</h2>
          <div className={styles.grid}>
            {activeBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                href={`/portal/budgets/${budget.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {lockedBudgets.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>LOCKED/CLOSED ({lockedBudgets.length})</h2>
          <div className={styles.grid}>
            {lockedBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                href={`/portal/budgets/${budget.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BudgetsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>BUDGETS</h1>
        <Link href="/portal/budgets/new" className={styles.createButton}>
          CREATE BUDGET
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <BudgetsList />
      </Suspense>
    </div>
  );
}
