import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Legend Dashboard | GVTEWAY',
  description: 'Platform owner event management dashboard',
};

async function LegendDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/legend');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch user's events count
  const { count: eventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id);

  // Fetch user's organizations count
  const { count: orgsCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id);

  // Fetch user's tasks count
  const { count: tasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', user.id)
    .neq('task_status', 'completed');

  return (
    <div className={styles.content}>
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>
          WELCOME BACK, {profile?.display_name?.toUpperCase() || 'LEGEND'}
        </h2>
        <p className={styles.welcomeSubtitle}>Legend Portal Dashboard</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{eventsCount || 0}</div>
          <div className={styles.statLabel}>EVENTS</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{orgsCount || 0}</div>
          <div className={styles.statLabel}>ORGANIZATIONS</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{tasksCount || 0}</div>
          <div className={styles.statLabel}>ACTIVE TASKS</div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>QUICK ACTIONS</h3>
        <div className={styles.actionsGrid}>
          <Link href="/organization/events/new" className={styles.actionCard}>
            <div className={styles.actionIcon}>+</div>
            <div className={styles.actionLabel}>CREATE EVENT</div>
          </Link>
          <Link href="/legend/organizations/new" className={styles.actionCard}>
            <div className={styles.actionIcon}>+</div>
            <div className={styles.actionLabel}>NEW ORGANIZATION</div>
          </Link>
          <Link href="/organization" className={styles.actionCard}>
            <div className={styles.actionIcon}>→</div>
            <div className={styles.actionLabel}>OPERATIONS</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LegendDashboardPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>DASHBOARD</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <LegendDashboard />
      </Suspense>
    </div>
  );
}
