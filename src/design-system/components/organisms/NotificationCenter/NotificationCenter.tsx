/**
 * NotificationCenter Component
 * GHXSTSHIP Entertainment Platform - Notification management center
 */

'use client'

import * as React from 'react'
import { useState } from 'react'
import styles from './NotificationCenter.module.css'

export interface Notification {
  id: string
  type: 'mention' | 'assignment' | 'comment' | 'update' | 'deadline' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export interface NotificationCenterProps {
  notifications: Notification[]
  onNotificationClick?: (notificationId: string) => void
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onClearAll?: () => void
  className?: string
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : !n.read
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention': return '@'
      case 'assignment': return '👤'
      case 'comment': return '💬'
      case 'update': return '🔄'
      case 'deadline': return '⏰'
      case 'system': return 'ℹ'
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
    <div className={`${styles.center} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </div>

        <div className={styles.actions}>
          {onMarkAllAsRead && unreadCount > 0 && (
            <button className={styles.actionButton} onClick={onMarkAllAsRead}>
              Mark all read
            </button>
          )}
          {onClearAll && (
            <button className={styles.actionButton} onClick={onClearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className={styles.list}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.empty}>No notifications</div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`${styles.notification} ${!notification.read ? styles.unread : ''}`}
              onClick={() => onNotificationClick?.(notification.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNotificationClick?.(notification.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={`${styles.icon} ${styles[notification.type]}`}>
                {getNotificationIcon(notification.type)}
              </div>

              <div className={styles.content}>
                <h4 className={styles.notificationTitle}>{notification.title}</h4>
                <p className={styles.message}>{notification.message}</p>
                <span className={styles.timestamp}>
                  {getRelativeTime(notification.timestamp)}
                </span>
              </div>

              {!notification.read && <div className={styles.unreadDot} />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

NotificationCenter.displayName = 'NotificationCenter'
