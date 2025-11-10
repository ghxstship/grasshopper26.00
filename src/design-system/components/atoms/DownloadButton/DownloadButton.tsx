/**
 * DownloadButton Component
 * GHXSTSHIP Entertainment Platform - Download action button
 * Geometric button for ticket/pass downloads
 */

import * as React from 'react';
import styles from './DownloadButton.module.css';

export type DownloadButtonSize = 'sm' | 'md' | 'lg';
export type DownloadButtonVariant = 'default' | 'icon-only';

export interface DownloadButtonProps {
  href: string;
  filename?: string;
  size?: DownloadButtonSize;
  variant?: DownloadButtonVariant;
  disabled?: boolean;
  className?: string;
}

export const DownloadButton = React.forwardRef<HTMLAnchorElement, DownloadButtonProps>(
  (
    {
      href,
      filename,
      size = 'md',
      variant = 'default',
      disabled = false,
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[size],
      styles[variant],
      disabled && styles.disabled,
      className,
    ].filter(Boolean).join(' ');

    if (disabled) {
      return (
        <span
          ref={ref as any}
          className={classNames}
          aria-label="Download"
          aria-disabled={disabled}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {variant === 'default' && (
            <span className={styles.label}>DOWNLOAD</span>
          )}
        </span>
      );
    }

    return (
      <a
        ref={ref}
        href={href}
        download={filename}
        className={classNames}
        aria-label="Download"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {variant === 'default' && (
          <span className={styles.label}>DOWNLOAD</span>
        )}
      </a>
    );
  }
);

DownloadButton.displayName = 'DownloadButton';
