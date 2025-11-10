/**
 * NewsGrid Component
 * GHXSTSHIP Entertainment Platform - News/Blog Grid
 * Mixed layout with featured articles
 */

'use client';

import * as React from 'react';
import { NewsCard, NewsCardProps } from '../../molecules/NewsCard';
import styles from './NewsGrid.module.css';

export interface NewsGridProps {
  articles: NewsCardProps['article'][];
  onArticleClick?: (articleId: string) => void;
  featuredCount?: number;
  className?: string;
}

export const NewsGrid = React.forwardRef<HTMLDivElement, NewsGridProps>(
  (
    {
      articles,
      onArticleClick,
      featuredCount = 1,
      className = '',
    },
    ref
  ) => {
    const featuredArticles = articles.slice(0, featuredCount);
    const regularArticles = articles.slice(featuredCount);

    const classNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        {featuredArticles.length > 0 && (
          <div className={styles.featured}>
            {featuredArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                variant="horizontal"
                onClick={() => onArticleClick?.(article.id)}
                className={styles.featuredCard}
              />
            ))}
          </div>
        )}

        {regularArticles.length > 0 && (
          <div className={styles.grid}>
            {regularArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                variant="vertical"
                onClick={() => onArticleClick?.(article.id)}
              />
            ))}
          </div>
        )}

        {articles.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>▪</div>
            <p className={styles.emptyText}>NO NEWS ARTICLES FOUND</p>
          </div>
        )}
      </div>
    );
  }
);

NewsGrid.displayName = 'NewsGrid';
