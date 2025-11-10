/**
 * NewsCard Component
 * GHXSTSHIP Entertainment Platform - News/Blog Article Card
 * B&W imagery, BEBAS NEUE headlines, SHARE TECH body copy
 */

import * as React from 'react';
import Image from 'next/image';
import styles from './NewsCard.module.css';

export interface NewsCardProps {
  article: {
    id: string;
    title: string;
    excerpt?: string;
    imageUrl?: string;
    date: string;
    category?: string;
    author?: string;
  };
  onClick?: () => void;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const NewsCard = React.forwardRef<HTMLDivElement, NewsCardProps>(
  ({ article, onClick, variant = 'vertical', className = '' }, ref) => {
    const classNames = [
      styles.card,
      styles[variant],
      onClick && styles.clickable,
      className,
    ].filter(Boolean).join(' ');

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <article
        ref={ref}
        className={classNames}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `Read article: ${article.title}` : undefined}
      >
        {article.imageUrl && (
          <div className={styles.imageContainer}>
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className={styles.halftoneOverlay} aria-hidden="true" />
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.meta}>
            {article.category && (
              <span className={styles.category}>{article.category}</span>
            )}
            <span className={styles.date}>{article.date}</span>
          </div>

          <h3 className={styles.title}>{article.title}</h3>

          {article.excerpt && (
            <p className={styles.excerpt}>{article.excerpt}</p>
          )}

          {article.author && (
            <div className={styles.author}>
              <span className={styles.authorLabel}>BY</span>
              <span className={styles.authorName}>{article.author}</span>
            </div>
          )}
        </div>
      </article>
    );
  }
);

NewsCard.displayName = 'NewsCard';
