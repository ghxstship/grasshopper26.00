/**
 * TaskBoard Component
 * GHXSTSHIP Entertainment Platform - Kanban-style task board
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './TaskBoard.module.css'

export interface Task {
  id: string
  taskName: string
  description?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'completed'
  assignedTo?: string
  dueDate?: Date
}

export interface TaskBoardProps {
  tasks: Task[]
  onTaskClick?: (taskId: string) => void
  onTaskMove?: (taskId: string, newStatus: Task['status']) => void
  onAddTask?: (status: Task['status']) => void
  className?: string
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskClick,
  onTaskMove,
  onAddTask,
  className = '',
}) => {
  const columns: Array<{ status: Task['status']; label: string }> = [
    { status: 'todo', label: 'To Do' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'in_review', label: 'In Review' },
    { status: 'completed', label: 'Completed' },
  ]

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className={`${styles.board} ${className}`}>
      {columns.map(column => (
        <div key={column.status} className={styles.column}>
          <div className={styles.columnHeader}>
            <h3 className={styles.columnTitle}>{column.label}</h3>
            <span className={styles.columnCount}>
              {getTasksByStatus(column.status).length}
            </span>
          </div>

          <div className={styles.columnContent}>
            {getTasksByStatus(column.status).map(task => (
              <div
                key={task.id}
                className={styles.task}
                onClick={() => onTaskClick?.(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTaskClick?.(task.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.taskHeader}>
                  <span className={`${styles.priority} ${styles[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>

                <h4 className={styles.taskName}>{task.taskName}</h4>

                {task.description && (
                  <p className={styles.taskDescription}>{task.description}</p>
                )}

                <div className={styles.taskMeta}>
                  {task.assignedTo && (
                    <span className={styles.assignee}>{task.assignedTo}</span>
                  )}
                  {task.dueDate && (
                    <span className={styles.dueDate}>
                      {task.dueDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {onAddTask && (
              <button
                className={styles.addButton}
                onClick={() => onAddTask(column.status)}
              >
                + Add Task
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

TaskBoard.displayName = 'TaskBoard'
