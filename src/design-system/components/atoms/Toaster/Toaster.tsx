/**
 * Toaster - Toast notification container
 * GHXSTSHIP Design System
 */

'use client';

import { useEffect, useState } from 'react';
import styles from './Toaster.module.css';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

export interface ToasterProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`${styles.toast} ${styles[toast.variant || 'default']} ${
        isExiting ? styles.exiting : ''
      }`}
      role="alert"
    >
      <div className={styles.content}>
        <div className={styles.title}>{toast.title}</div>
        {toast.description && <div className={styles.description}>{toast.description}</div>}
      </div>
      <button
        className={styles.close}
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
