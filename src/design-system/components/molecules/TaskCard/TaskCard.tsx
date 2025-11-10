/**
 * TaskCard Component
 * GHXSTSHIP Entertainment Platform - Task card for project management
 */

import * as React from 'react'
import styles from './TaskCard.module.css'

export interface TaskCardProps {
  taskName: string
  description?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'completed' | 'cancelled'
  assignedTo?: string
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  completionPercentage?: number
  onClick?: () => void
  className?: string
}

export const TaskCard: React.FC<TaskCardProps> = ({
  taskName,
  description,
  priority,
  status,
  assignedTo,
  dueDate,
  estimatedHours,
  actualHours = 0,
  completionPercentage = 0,
  onClick,
  className = '',
}) => {
  const isOverdue = dueDate && new Date() > dueDate && status !== 'completed'

  return (
    <div 
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={styles.header}>
        <div className={styles.badges}>
          <span className={`${styles.priority} ${styles[priority]}`}>
            {priority}
          </span>
          <span className={`${styles.status} ${styles[status]}`}>
            {status.replace('_', ' ')}
          </span>
        </div>
        {isOverdue && <span className={styles.overdue}>OVERDUE</span>}
      </div>

      <h3 className={styles.title}>{taskName}</h3>
      
      {description && (
        <p className={styles.description}>{description}</p>
      )}

      <div className={styles.meta}>
        {assignedTo && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Assigned</span>
            <span className={styles.metaValue}>{assignedTo}</span>
          </div>
        )}
        
        {dueDate && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Due</span>
            <span className={styles.metaValue}>
              {dueDate.toLocaleDateString()}
            </span>
          </div>
        )}
        
        {estimatedHours && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Hours</span>
            <span className={styles.metaValue}>
              {actualHours}/{estimatedHours}h
            </span>
          </div>
        )}
      </div>

      {completionPercentage > 0 && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className={styles.progressLabel}>{completionPercentage}%</span>
        </div>
      )}
    </div>
  )
}

TaskCard.displayName = 'TaskCard'
