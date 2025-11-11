import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BudgetCard } from '@/design-system/components/molecules/BudgetCard';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

async function EventBudgets({ eventId }: { eventId: string }) {
  const supabase = await createClient();
  
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!budgets || budgets.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO BUDGETS FOR THIS EVENT</p>
        <Link href={`/portal/budgets/new?event_id=${eventId}`} className={styles.createButton}>
          CREATE BUDGET
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          href={`/portal/budgets/${budget.id}`}
        />
      ))}
    </div>
  );
}

export default async function EventBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('event_name')
    .eq('id', id)
    .single();

  if (!event) notFound();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>EVENT BUDGET</h1>
        <Link href={`/portal/budgets/new?event_id=${id}`} className={styles.createButton}>
          CREATE BUDGET
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <EventBudgets eventId={id} />
      </Suspense>
    </div>
  );
}
