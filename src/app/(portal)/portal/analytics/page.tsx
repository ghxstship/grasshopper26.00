import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { EventDashboardCard } from '@/design-system/components/molecules/EventDashboardCard';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Analytics | GVTEWAY',
  description: 'Platform analytics and KPIs',
};

async function AnalyticsDashboard() {
  const supabase = await createClient();

  // Get total events
  const { data: events } = await supabase
    .from('events')
    .select('id, event_status, event_start_date');

  const totalEvents = events?.length || 0;
  const upcomingEvents = events?.filter(e => 
    new Date(e.event_start_date) >= new Date()
  ).length || 0;
  const completedEvents = events?.filter(e => 
    e.event_status === 'completed'
  ).length || 0;

  // Get total revenue
  const { data: tickets } = await supabase
    .from('tickets')
    .select('final_price, ticket_status');

  const totalRevenue = tickets
    ?.filter(t => ['active', 'checked_in'].includes(t.ticket_status))
    .reduce((sum, t) => sum + t.final_price, 0) || 0;

  const totalTicketsSold = tickets
    ?.filter(t => ['active', 'checked_in'].includes(t.ticket_status))
    .length || 0;

  // Get active tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('task_status');

  const activeTasks = tasks?.filter(t => 
    ['todo', 'in_progress'].includes(t.task_status)
  ).length || 0;

  // Get active vendors
  const { data: vendors } = await supabase
    .from('vendors')
    .select('vendor_status');

  const activeVendors = vendors?.filter(v => 
    v.vendor_status === 'active'
  ).length || 0;

  // Get total budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select('total_profit_budgeted, budget_status');

  const projectedProfit = budgets
    ?.filter(b => b.budget_status === 'approved')
    .reduce((sum, b) => sum + b.total_profit_budgeted, 0) || 0;

  return (
    <div className={styles.content}>
      <div className={styles.grid}>
        <EventDashboardCard
          title="TOTAL EVENTS"
          value={totalEvents}
          subtitle={`${upcomingEvents} upcoming`}
        />
        
        <EventDashboardCard
          title="TOTAL REVENUE"
          value={`$${totalRevenue.toLocaleString()}`}
          subtitle={`${totalTicketsSold} tickets sold`}
        />
        
        <EventDashboardCard
          title="PROJECTED PROFIT"
          value={`$${projectedProfit.toLocaleString()}`}
          subtitle="From approved budgets"
        />
        
        <EventDashboardCard
          title="COMPLETED EVENTS"
          value={completedEvents}
        />
        
        <EventDashboardCard
          title="ACTIVE TASKS"
          value={activeTasks}
        />
        
        <EventDashboardCard
          title="ACTIVE VENDORS"
          value={activeVendors}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ANALYTICS</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
