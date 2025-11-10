/**
 * Alert Component
 * GHXSTSHIP Entertainment Platform - Alert/Notification
 * Geometric alert boxes with thick borders
 */

import * as React from 'react';
import styles from './Alert.module.css';

export interface AlertProps {
  title?: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ title, message, variant = 'info', icon, onClose, className = '' }, ref) => {
    const defaultIcons = {
      info: '◉',
      success: '✓',
      warning: '▲',
      error: '✕',
    };

    const classNames = [
      styles.alert,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} role="alert">
        <div className={styles.iconContainer}>
          <span className={styles.icon} aria-hidden="true">
            {icon || defaultIcons[variant]}
          </span>
        </div>

        <div className={styles.content}>
          {title && <div className={styles.title}>{title}</div>}
          <div className={styles.message}>{message}</div>
        </div>

        {onClose && (
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close alert"
          >
            <span className={styles.closeIcon} aria-hidden="true">
              ✕
            </span>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
