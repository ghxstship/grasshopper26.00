'use client';

import React from 'react';
import Link from 'next/link';
import styles from './TaskListItem.module.css';
import { TaskPriorityBadge } from '../../atoms/TaskPriorityBadge';
import { StatusBadge } from '../../atoms/StatusBadge';
import type { Task } from '@/types/super-expansion';

export interface TaskListItemProps {
  task: Task;
  href?: string;
  showEvent?: boolean;
  className?: string;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  href,
  showEvent = false,
  className,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = new Date(task.due_date) < new Date() && task.task_status !== 'completed';

  const content = (
    <div className={`${styles.item} ${isOverdue ? styles.overdue : ''} ${className || ''}`}>
      <div className={styles.main}>
        <div className={styles.header}>
          <h4 className={styles.title}>{task.task_name}</h4>
          <div className={styles.badges}>
            <TaskPriorityBadge priority={task.priority} />
            <StatusBadge status={task.task_status as any} />
          </div>
        </div>

        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            DUE: {formatDate(task.due_date)}
          </span>
          {task.assigned_to && (
            <span className={styles.metaItem}>
              ASSIGNED
            </span>
          )}
          {showEvent && (
            <span className={styles.metaItem}>
              EVENT
            </span>
          )}
        </div>
      </div>

      {isOverdue && (
        <div className={styles.overdueIndicator}>
          OVERDUE
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
};

TaskListItem.displayName = 'TaskListItem';
