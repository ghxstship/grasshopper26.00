import { Suspense } from 'react';
import { getTasksByUser } from '@/lib/actions/tasks';
import { TaskListItem } from '@/design-system';
import { Spinner } from '@/design-system';
import { createClient } from '@/lib/supabase/server';
import styles from './page.module.css';

export const metadata = {
  title: 'My Tasks | GVTEWAY',
  description: 'View and manage your tasks',
};

async function TasksList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div className={styles.empty}>NOT AUTHENTICATED</div>;
  }

  const tasks = await getTasksByUser(user.id);

  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>NO TASKS ASSIGNED</p>
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.task_status === 'todo');
  const inProgressTasks = tasks.filter(t => t.task_status === 'in_progress');
  const blockedTasks = tasks.filter(t => t.task_status === 'blocked');

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
                showEvent={true}
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
                showEvent={true}
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
                showEvent={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>MY TASKS</h1>
      </div>

      <Suspense fallback={<Spinner />}>
        <TasksList />
      </Suspense>
    </div>
  );
}
