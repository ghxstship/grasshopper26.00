/**
 * Modal - Modal dialog molecule
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { Card, Stack, Heading, Button, Text } from '../../atoms';
import styles from './Modal.module.css';

export interface ModalProps {
  /** Modal open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal description */
  description?: string;
  /** Modal content */
  children: ReactNode;
  /** Footer actions */
  actions?: ReactNode;
  /** Max width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`${styles.modal} ${styles[`maxWidth-${maxWidth}`]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Card variant="elevated" padding={8}>
          <Stack gap={6}>
            <Stack gap={2}>
              <Heading level={2} font="bebas" id="modal-title">
                {title}
              </Heading>
              {description && (
                <Text color="secondary">{description}</Text>
              )}
            </Stack>

            <div className={styles.content}>{children}</div>

            {actions && (
              <div className={styles.actions}>{actions}</div>
            )}
          </Stack>
        </Card>
      </div>
    </div>
  );
}
