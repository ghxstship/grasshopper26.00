/**
 * ActivityFeed Component
 * GHXSTSHIP Entertainment Platform - Real-time activity feed
 */

'use client'

import * as React from 'react'
import styles from './ActivityFeed.module.css'

export interface Activity {
  id: string
  type: 'create' | 'update' | 'delete' | 'comment' | 'assign' | 'status_change'
  user: string
  action: string
  target?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ActivityFeedProps {
  activities: Activity[]
  onActivityClick?: (activityId: string) => void
  showFilters?: boolean
  className?: string
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onActivityClick,
  showFilters = false,
  className = '',
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'create': return '+'
      case 'update': return '✎'
      case 'delete': return '×'
      case 'comment': return '💬'
      case 'assign': return '👤'
      case 'status_change': return '⟳'
      default: return '•'
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className={`${styles.feed} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Activity Feed</h3>
      </div>

      <div className={styles.list}>
        {activities.map(activity => (
          <div
            key={activity.id}
            className={styles.item}
            onClick={() => onActivityClick?.(activity.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivityClick?.(activity.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className={`${styles.icon} ${styles[activity.type]}`}>
              {getActivityIcon(activity.type)}
            </div>

            <div className={styles.content}>
              <div className={styles.action}>
                <span className={styles.user}>{activity.user}</span>
                <span className={styles.actionText}>{activity.action}</span>
                {activity.target && (
                  <span className={styles.target}>{activity.target}</span>
                )}
              </div>

              <div className={styles.meta}>
                <span className={styles.timestamp}>
                  {getRelativeTime(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

ActivityFeed.displayName = 'ActivityFeed'
