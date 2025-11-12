import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

async function TaskDetails({ id }: { id: string }) {
  const supabase = await createClient();
  
  const { data: task, error } = await supabase
    .from('tasks')
    .select(`
      *,
      event:events(event_name),
      phase:project_phases(phase_name),
      milestone:project_milestones(milestone_name)
    `)
    .eq('id', id)
    .single();

  if (error || !task) notFound();

  return (
    <div className={styles.content}>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.label}>STATUS</span>
          <span className={`${styles.value} ${styles[task.task_status]}`}>
            {task.task_status.toUpperCase().replace('_', ' ')}
          </span>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.label}>PRIORITY</span>
          <span className={`${styles.value} ${styles[task.priority]}`}>
            {task.priority.toUpperCase()}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>DUE DATE</span>
          <span className={styles.value}>
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>COMPLETION</span>
          <span className={styles.value}>{task.completion_percentage}%</span>
        </div>
      </div>

      {task.description && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>DESCRIPTION</h3>
          <p className={styles.description}>{task.description}</p>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>DETAILS</h3>
        <div className={styles.detailsGrid}>
          {task.event && (
            <div className={styles.detailItem}>
              <span className={styles.label}>EVENT</span>
              <span className={styles.value}>{task.event.event_name}</span>
            </div>
          )}
          {task.phase && (
            <div className={styles.detailItem}>
              <span className={styles.label}>PHASE</span>
              <span className={styles.value}>{task.phase.phase_name}</span>
            </div>
          )}
          {task.milestone && (
            <div className={styles.detailItem}>
              <span className={styles.label}>MILESTONE</span>
              <span className={styles.value}>{task.milestone.milestone_name}</span>
            </div>
          )}
          {task.estimated_hours && (
            <div className={styles.detailItem}>
              <span className={styles.label}>ESTIMATED HOURS</span>
              <span className={styles.value}>{task.estimated_hours}h</span>
            </div>
          )}
          {task.actual_hours && (
            <div className={styles.detailItem}>
              <span className={styles.label}>ACTUAL HOURS</span>
              <span className={styles.value}>{task.actual_hours}h</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: task } = await supabase
    .from('tasks')
    .select('task_name')
    .eq('id', id)
    .single();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{task?.task_name || 'TASK'}</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <TaskDetails id={id} />
      </Suspense>
    </div>
  );
}
