/**
 * Alert - Alert/notification molecule
 * GHXSTSHIP Atomic Design System
 */

import { ReactNode } from 'react';
import { Stack, Text, Button } from '../../atoms';
import styles from './Alert.module.css';

export interface AlertProps {
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Alert title */
  title?: string;
  /** Alert message */
  children: ReactNode;
  /** Dismissible */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
}

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible,
  onDismiss,
}: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[`variant-${variant}`]}`} role="alert">
      <Stack gap={2}>
        {title && (
          <Text font="bebas" size="lg" uppercase weight="bold">
            {title}
          </Text>
        )}
        <div className={styles.content}>
          {typeof children === 'string' ? <Text>{children}</Text> : children}
        </div>
      </Stack>
      {dismissible && onDismiss && (
        <button
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
