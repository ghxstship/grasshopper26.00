'use client';

import React, { useEffect } from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = [
    styles.modal,
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (closeOnOverlayClick) onClose();
      }
    }} role="button" tabIndex={0}>
      <div className={modalClasses} role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
        {title && (
          <div className={styles.header}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        )}

        <div className={styles.content}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';
