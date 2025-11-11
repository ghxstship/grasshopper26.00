'use client';

import React from 'react';
import styles from './TaskPriorityBadge.module.css';
import type { TaskPriority } from '@/types/super-expansion';

export interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const priorityLabels: Record<TaskPriority, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({
  priority,
  className,
}) => {
  return (
    <span className={`${styles.badge} ${styles[priority]} ${className || ''}`}>
      {priorityLabels[priority]}
    </span>
  );
};

TaskPriorityBadge.displayName = 'TaskPriorityBadge';
