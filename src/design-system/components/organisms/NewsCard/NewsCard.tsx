'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './NewsCard.module.css';

export interface NewsCardProps {
  /** Article title */
  title: string;
  /** Article excerpt */
  excerpt: string;
  /** Featured image URL */
  imageUrl: string;
  /** Image alt text */
  imageAlt?: string;
  /** Article link */
  href: string;
  /** Category */
  category?: string;
  /** Author name */
  authorName?: string;
  /** Author avatar URL */
  authorAvatar?: string;
  /** Publication date */
  date: string;
  /** Reading time */
  readTime?: string;
  /** Tags */
  tags?: string[];
  /** Card variant */
  variant?: 'default' | 'horizontal';
  /** Additional CSS class */
  className?: string;
}

/**
 * NewsCard Organism - GHXSTSHIP Design System
 * 
 * News/blog article card with:
 * - High-contrast B&W imagery
 * - BEBAS NEUE headlines
 * - SHARE TECH body copy
 * - SHARE TECH MONO metadata
 * - Thick 3px borders
 * - Vertical lift animation on hover
 * 
 * @example
 * ```tsx
 * <NewsCard
 *   title="EDC LAS VEGAS 2025 LINEUP ANNOUNCED"
 *   excerpt="The world's premier electronic music festival reveals its star-studded lineup..."
 *   imageUrl="/news/edc-lineup.jpg"
 *   href="/news/edc-lineup-2025"
 *   category="LINEUP"
 *   authorName="EDITORIAL TEAM"
 *   date="JAN 15, 2025"
 *   readTime="5 MIN READ"
 *   tags={['EDC', 'LINEUP', 'FESTIVAL']}
 * />
 * ```
 */
export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  excerpt,
  imageUrl,
  imageAlt,
  href,
  category,
  authorName,
  authorAvatar,
  date,
  readTime,
  tags = [],
  variant = 'default',
  className = '',
}) => {
  const cardClasses = [
    styles.card,
    variant === 'horizontal' && styles.horizontal,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link href={href} className={cardClasses}>
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={imageAlt || title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {category && <div className={styles.category}>{category}</div>}
      </div>

      <div className={styles.content}>
        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <span>📅</span>
            <span>{date}</span>
          </div>
          {readTime && (
            <div className={styles.metaItem}>
              <span>⏱</span>
              <span>{readTime}</span>
            </div>
          )}
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.excerpt}>{excerpt}</p>

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {authorName && (
          <div className={styles.author}>
            {authorAvatar && (
              <div className={styles.authorAvatar}>
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  width={40}
                  height={40}
                  className={styles.authorImage}
                />
              </div>
            )}
            <span className={styles.authorName}>{authorName}</span>
          </div>
        )}

        <div className={styles.readMore}>
          <span>READ MORE</span>
          <span className={styles.arrow}>→</span>
        </div>
      </div>
    </Link>
  );
};

NewsCard.displayName = 'NewsCard';
