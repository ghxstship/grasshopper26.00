import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTicketSalesStats } from '@/lib/actions/ticketing';
import { getTasksByEvent } from '@/lib/actions/tasks';
import { getBudgetsByEvent } from '@/lib/actions/budgets';
import { EventDashboardCard } from '@/design-system/components/molecules/EventDashboardCard';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

export const metadata = {
  title: 'Event Dashboard | GVTEWAY',
  description: 'Event production dashboard',
};

interface EventDashboardPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EventDashboard({ eventId }: { eventId: string }) {
  const supabase = await createClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!event) {
    return <div className={styles.empty}>EVENT NOT FOUND</div>;
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('event_id', eventId);

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('event_id', eventId);

  const [ticketStats] = await Promise.all([
    getTicketSalesStats(eventId),
  ]);

  const openTasks = tasks?.filter((t: any) => 
    ['todo', 'in_progress', 'blocked'].includes(t.task_status)
  ).length || 0;

  const overdueTasks = tasks?.filter((t: any) => 
    new Date(t.due_date) < new Date() && t.task_status !== 'completed'
  ).length || 0;

  const activeBudget = budgets?.find(b => b.budget_status === 'approved');

  const daysUntilEvent = event.event_start_date 
    ? Math.ceil((new Date(event.event_start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={styles.content}>
      <div className={styles.eventHeader}>
        <div>
          <h2 className={styles.eventName}>{event.event_name}</h2>
          <div className={styles.eventMeta}>
            {event.event_start_date && (
              <span className={styles.eventDate}>
                {new Date(event.event_start_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
            {event.venue_name && (
              <span className={styles.eventVenue}>{event.venue_name}</span>
            )}
          </div>
        </div>
        {daysUntilEvent !== null && (
          <div className={styles.countdown}>
            <span className={styles.countdownNumber}>{daysUntilEvent}</span>
            <span className={styles.countdownLabel}>DAYS UNTIL EVENT</span>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {ticketStats && (
          <>
            <EventDashboardCard
              title="TICKETS SOLD"
              value={ticketStats.soldTickets.toLocaleString()}
              subtitle={`${ticketStats.sellThroughRate.toFixed(1)}% sell-through`}
              href={`/portal/events/${eventId}/tickets`}
            />
            
            <EventDashboardCard
              title="TICKET REVENUE"
              value={`$${ticketStats.totalRevenue.toLocaleString()}`}
              href={`/portal/events/${eventId}/tickets`}
            />
            
            <EventDashboardCard
              title="CAPACITY"
              value={`${ticketStats.soldTickets}/${ticketStats.totalCapacity}`}
              subtitle={`${ticketStats.availableTickets} available`}
            />
          </>
        )}

        <EventDashboardCard
          title="OPEN TASKS"
          value={openTasks}
          subtitle={overdueTasks > 0 ? `${overdueTasks} overdue` : 'All on track'}
          href={`/portal/events/${eventId}/tasks`}
          trend={overdueTasks > 0 ? 'down' : 'neutral'}
        />

        {activeBudget && (
          <>
            <EventDashboardCard
              title="BUDGET STATUS"
              value={activeBudget.budget_status.toUpperCase()}
              subtitle={activeBudget.budget_name}
              href={`/portal/budgets/${activeBudget.id}`}
            />
            
            <EventDashboardCard
              title="PROJECTED PROFIT"
              value={`$${activeBudget.total_profit_budgeted.toLocaleString()}`}
              subtitle={`${activeBudget.profit_margin_budgeted?.toFixed(1) || 0}% margin`}
              href={`/portal/budgets/${activeBudget.id}`}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default async function EventDashboardPage({ params }: EventDashboardPageProps) {
  const { id } = await params;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>EVENT DASHBOARD</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <EventDashboard eventId={id} />
      </Suspense>
    </div>
  );
}
