/**
 * Modal Component
 * GHXSTSHIP Entertainment Platform - Modal Dialog
 * Geometric modal with thick borders and hard shadows
 */

import * as React from 'react';
import styles from './Modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      size = 'md',
      showCloseButton = true,
      closeOnOverlayClick = true,
      className = '',
    },
    ref
  ) => {
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    };

    const modalClassNames = [
      styles.modal,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={styles.overlay} onClick={closeOnOverlayClick ? onClose : undefined} onKeyDown={handleOverlayKeyDown} role="button" tabIndex={0}>
        <div
          ref={ref}
          className={modalClassNames}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {(title || showCloseButton) && (
            <div className={styles.header}>
              {title && (
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
                  <span className={styles.closeIcon} aria-hidden="true">
                    ✕
                  </span>
                </button>
              )}
            </div>
          )}

          <div className={styles.content}>{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
