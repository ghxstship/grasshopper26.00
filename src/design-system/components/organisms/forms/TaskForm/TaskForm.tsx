'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createTask, updateTask } from '@/lib/actions/tasks';
import styles from './TaskForm.module.css';
import type { Task } from '@/types/super-expansion';

export interface TaskFormProps {
  eventId: string;
  task?: Task;
  mode: 'create' | 'edit';
}

export const TaskForm: React.FC<TaskFormProps> = ({
  eventId,
  task,
  mode,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (mode === 'create') {
        await createTask(eventId, formData);
      } else if (task) {
        await updateTask(task.id, formData);
      }
      
      router.push(`/portal/events/${eventId}/tasks`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>TASK DETAILS</h2>
        
        <div className={styles.field}>
          <label htmlFor="task_name" className={styles.label}>
            TASK NAME *
          </label>
          <input
            type="text"
            id="task_name"
            name="task_name"
            defaultValue={task?.task_name}
            required
            className={styles.input}
            placeholder="e.g., Confirm venue booking"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            DESCRIPTION
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={task?.description || ''}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="priority" className={styles.label}>
              PRIORITY *
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={task?.priority || 'medium'}
              required
              className={styles.select}
            >
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
              <option value="critical">CRITICAL</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="task_status" className={styles.label}>
              STATUS *
            </label>
            <select
              id="task_status"
              name="task_status"
              defaultValue={task?.task_status || 'todo'}
              required
              className={styles.select}
            >
              <option value="todo">TO DO</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="blocked">BLOCKED</option>
              <option value="in_review">IN REVIEW</option>
              <option value="completed">COMPLETED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="due_date" className={styles.label}>
              DUE DATE *
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              defaultValue={task?.due_date?.split('T')[0]}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="estimated_hours" className={styles.label}>
              ESTIMATED HOURS
            </label>
            <input
              type="number"
              id="estimated_hours"
              name="estimated_hours"
              step="0.5"
              min="0"
              className={styles.input}
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.buttonSecondary}
          disabled={isSubmitting}
        >
          CANCEL
        </button>
        <button
          type="submit"
          className={styles.buttonPrimary}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'SAVING...' : mode === 'create' ? 'CREATE TASK' : 'UPDATE TASK'}
        </button>
      </div>
    </form>
  );
};

TaskForm.displayName = 'TaskForm';
