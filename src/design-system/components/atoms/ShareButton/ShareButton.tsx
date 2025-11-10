/**
 * ShareButton Component
 * GHXSTSHIP Entertainment Platform - Social share button
 * Geometric share button with platform options
 */

import * as React from 'react';
import styles from './ShareButton.module.css';

export type ShareButtonSize = 'sm' | 'md' | 'lg';
export type ShareButtonVariant = 'default' | 'icon-only';

export interface ShareButtonProps {
  url: string;
  title?: string;
  size?: ShareButtonSize;
  variant?: ShareButtonVariant;
  onClick?: () => void;
  className?: string;
}

export const ShareButton = React.forwardRef<HTMLButtonElement, ShareButtonProps>(
  (
    {
      url,
      title = 'Share',
      size = 'md',
      variant = 'default',
      onClick,
      className = '',
    },
    ref
  ) => {
    const handleShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            url,
          });
        } catch (err) {
          console.error('Share failed:', err);
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url);
      }
      onClick?.();
    };

    const classNames = [
      styles.button,
      styles[size],
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type="button"
        className={classNames}
        onClick={handleShare}
        aria-label="Share"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        {variant === 'default' && (
          <span className={styles.label}>SHARE</span>
        )}
      </button>
    );
  }
);

ShareButton.displayName = 'ShareButton';
