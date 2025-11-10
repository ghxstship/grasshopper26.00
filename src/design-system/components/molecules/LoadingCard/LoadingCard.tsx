/**
 * LoadingCard Component
 * GHXSTSHIP Entertainment Platform - Loading State Card
 * Geometric shapes animation, no circular spinners
 */

import * as React from 'react';
import styles from './LoadingCard.module.css';

export interface LoadingCardProps {
  variant?: 'event' | 'artist' | 'ticket' | 'news';
  className?: string;
}

export const LoadingCard = React.forwardRef<HTMLDivElement, LoadingCardProps>(
  ({ variant = 'event', className = '' }, ref) => {
    const classNames = [
      styles.card,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} aria-busy="true" aria-label="Loading content">
        <div className={styles.skeleton}>
          {variant === 'event' && (
            <>
              <div className={styles.imageBlock} />
              <div className={styles.content}>
                <div className={styles.titleBlock} />
                <div className={styles.textBlock} />
                <div className={styles.badgeBlock} />
              </div>
            </>
          )}

          {variant === 'artist' && (
            <>
              <div className={styles.imageCircle} />
              <div className={styles.content}>
                <div className={styles.titleBlock} />
                <div className={styles.tagsBlock} />
              </div>
            </>
          )}

          {variant === 'ticket' && (
            <div className={styles.content}>
              <div className={styles.headerBlock} />
              <div className={styles.textBlock} />
              <div className={styles.textBlock} />
              <div className={styles.footerBlock} />
            </div>
          )}

          {variant === 'news' && (
            <>
              <div className={styles.imageBlock} />
              <div className={styles.content}>
                <div className={styles.metaBlock} />
                <div className={styles.titleBlock} />
                <div className={styles.textBlock} />
                <div className={styles.textBlock} />
              </div>
            </>
          )}
        </div>

        {/* Geometric loading indicator */}
        <div className={styles.loadingIndicator} aria-hidden="true">
          <div className={styles.square} />
        </div>
      </div>
    );
  }
);

LoadingCard.displayName = 'LoadingCard';
