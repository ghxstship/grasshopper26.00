import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TaskListItem } from '@/design-system/components/molecules/TaskListItem';
import { LoadingSpinner } from '@/design-system/components/atoms/LoadingSpinner';
import styles from './page.module.css';

async function EventTasks({ eventId }: { eventId: string }) {
  const supabase = await createClient();
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('event_id', eventId)
    .order('due_date', { ascending: true });

  if (error) throw error;

  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO TASKS FOR THIS EVENT</p>
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.task_status === 'todo');
  const inProgressTasks = tasks.filter(t => t.task_status === 'in_progress');
  const blockedTasks = tasks.filter(t => t.task_status === 'blocked');
  const completedTasks = tasks.filter(t => t.task_status === 'completed');

  return (
    <div className={styles.content}>
      {inProgressTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>IN PROGRESS ({inProgressTasks.length})</h2>
          <div className={styles.taskList}>
            {inProgressTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                href={`/portal/tasks/${task.id}`}
                showEvent={false}
              />
            ))}
          </div>
        </div>
      )}

      {blockedTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>BLOCKED ({blockedTasks.length})</h2>
          <div className={styles.taskList}>
            {blockedTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                href={`/portal/tasks/${task.id}`}
                showEvent={false}
              />
            ))}
          </div>
        </div>
      )}

      {todoTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>TO DO ({todoTasks.length})</h2>
          <div className={styles.taskList}>
            {todoTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                href={`/portal/tasks/${task.id}`}
                showEvent={false}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>COMPLETED ({completedTasks.length})</h2>
          <div className={styles.taskList}>
            {completedTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                href={`/portal/tasks/${task.id}`}
                showEvent={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function EventTasksPage({ params }: { params: Promise<{ id: string }> }) {
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
        <h1 className={styles.title}>EVENT TASKS</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <EventTasks eventId={id} />
      </Suspense>
    </div>
  );
}
