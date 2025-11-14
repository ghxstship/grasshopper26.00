/**
 * TaskListItem - Task list item molecule
 * GHXSTSHIP Atomic Design System
 */

import { Card, Text, StatusBadge } from '../../atoms';
import styles from './TaskListItem.module.css';

export interface TaskListItemProps {
  task: {
    id: string;
    task_name: string;
    task_status: string;
    due_date?: string;
  };
  href?: string;
  showEvent?: boolean;
}

export function TaskListItem({ task }: TaskListItemProps) {
  return (
    <Card>
      <div className={styles.header}>
        <Text weight="medium">{task.task_name}</Text>
        <StatusBadge status={task.task_status as any}>{task.task_status}</StatusBadge>
      </div>
      {task.due_date && (
        <Text size="sm" color="secondary" className={styles.dueDate}>
          Due: {new Date(task.due_date).toLocaleDateString()}
        </Text>
      )}
    </Card>
  );
}
