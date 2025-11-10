/**
 * TimelineView Component
 * GHXSTSHIP Entertainment Platform - Gantt-style timeline view
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './TimelineView.module.css'

export interface TimelineItem {
  id: string
  title: string
  start: Date
  end: Date
  progress?: number
  assignee?: string
  dependencies?: string[]
  color?: string
}

export interface TimelineViewProps {
  items: TimelineItem[]
  onItemClick?: (itemId: string) => void
  onItemResize?: (itemId: string, start: Date, end: Date) => void
  viewMode?: 'day' | 'week' | 'month'
  className?: string
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  items,
  onItemClick,
  onItemResize,
  viewMode = 'week',
  className = '',
}) => {
  const [currentDate] = useState(new Date())

  const getDaysInView = () => {
    switch (viewMode) {
      case 'day': return 7
      case 'week': return 14
      case 'month': return 30
      default: return 14
    }
  }

  const daysInView = getDaysInView()
  const startDate = new Date(currentDate)
  startDate.setDate(startDate.getDate() - 3)

  const getItemPosition = (item: TimelineItem) => {
    const itemStart = new Date(item.start)
    const itemEnd = new Date(item.end)
    const viewStart = startDate
    const dayWidth = 100 / daysInView

    const startOffset = Math.max(0, (itemStart.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24))
    const duration = (itemEnd.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24)

    return {
      left: `${startOffset * dayWidth}%`,
      width: `${duration * dayWidth}%`,
    }
  }

  return (
    <div className={`${styles.timeline} ${className}`}>
      <div className={styles.header}>
        <div className={styles.taskColumn}>Tasks</div>
        <div className={styles.chartColumn}>
          <div className={styles.dateHeaders}>
            {Array.from({ length: daysInView }).map((_, i) => {
              const date = new Date(startDate)
              date.setDate(date.getDate() + i)
              return (
                <div key={i} className={styles.dateHeader}>
                  <span className={styles.dateDay}>{date.getDate()}</span>
                  <span className={styles.dateMonth}>
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {items.map(item => (
          <div key={item.id} className={styles.row}>
            <div className={styles.taskInfo}>
              <h4 className={styles.taskTitle}>{item.title}</h4>
              {item.assignee && (
                <span className={styles.assignee}>{item.assignee}</span>
              )}
            </div>

            <div className={styles.chartArea}>
              <div className={styles.gridLines}>
                {Array.from({ length: daysInView }).map((_, i) => (
                  <div key={i} className={styles.gridLine} />
                ))}
              </div>

              <div
                className={styles.bar}
                style={getItemPosition(item)}
                onClick={() => onItemClick?.(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onItemClick?.(item.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.barContent}>
                  <span className={styles.barTitle}>{item.title}</span>
                  {item.progress !== undefined && (
                    <div className={styles.progress}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

TimelineView.displayName = 'TimelineView'
