'use client';

import React, { useEffect } from 'react';
import styles from './Notification.module.css';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

export interface NotificationProps {
  /** Notification type */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Notification title */
  title?: string;
  /** Notification message */
  message: string;
  /** Show notification */
  isVisible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Auto close duration in ms */
  autoCloseDuration?: number;
  /** Action buttons */
  actions?: NotificationAction[];
  /** Additional CSS class */
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  type = 'info',
  title,
  message,
  isVisible,
  onClose,
  autoCloseDuration,
  actions,
  className = '',
}) => {
  useEffect(() => {
    if (isVisible && autoCloseDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseDuration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      case 'info':
      default:
        return 'i';
    }
  };

  const notificationClasses = [
    styles.notification,
    styles[type],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={notificationClasses} role="alert">
      <div className={styles.header}>
        <div className={styles.icon}>{getIcon()}</div>
        <div className={styles.content}>
          {title && <h4 className={styles.title}>{title}</h4>}
          <p className={styles.message}>{message}</p>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close notification">
          ✕
        </button>
      </div>

      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={`${styles.actionButton} ${action.primary ? styles.primary : ''}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

Notification.displayName = 'Notification';
