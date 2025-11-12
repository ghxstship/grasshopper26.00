'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AdventureCard.module.css';

export interface AdventureCardProps {
  /** Adventure title */
  title: string;
  /** Adventure description */
  description?: string;
  /** Adventure image URL */
  imageUrl: string;
  /** Adventure image alt text */
  imageAlt?: string;
  /** Location name */
  location: string;
  /** City */
  city: string;
  /** Adventure link */
  href: string;
  /** Price range */
  priceRange?: string;
  /** Distance in miles (for geolocation results) */
  distance?: number;
  /** Adventure type/category */
  adventureType?: string;
  /** Difficulty level */
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert';
  /** Duration in hours */
  duration?: number;
  /** Tags */
  tags?: string[];
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured';
  /** Additional CSS class */
  className?: string;
}

/**
 * AdventureCard Organism - GHXSTSHIP Design System
 * 
 * Adventure card component with:
 * - High-contrast B&W imagery with grayscale filter
 * - BEBAS NEUE adventure titles
 * - SHARE TECH MONO location/metadata
 * - Thick 3px borders
 * - Hard geometric shadows on hover
 * - Scale animation on hover
 * - Distance display for geolocation results
 * 
 * @example
 * ```tsx
 * <AdventureCard
 *   title="KAYAKING ADVENTURE"
 *   description="Explore crystal clear springs"
 *   imageUrl="/adventures/kayaking.jpg"
 *   location="Rainbow Springs State Park"
 *   city="Dunnellon"
 *   href="/adventures/rainbow-springs-kayaking"
 *   priceRange="$$"
 *   distance={12.5}
 *   difficulty="moderate"
 *   duration={3}
 *   tags={['WATER', 'OUTDOOR', 'FAMILY-FRIENDLY']}
 * />
 * ```
 */
export const AdventureCard: React.FC<AdventureCardProps> = ({
  title,
  description,
  imageUrl,
  imageAlt,
  location,
  city,
  href,
  priceRange,
  distance,
  adventureType,
  difficulty,
  duration,
  tags = [],
  variant = 'default',
  className = '',
}) => {
  const cardClasses = [
    styles.card,
    variant === 'compact' && styles.compact,
    variant === 'featured' && styles.featured,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const difficultyLabel = difficulty ? {
    'easy': 'EASY',
    'moderate': 'MODERATE',
    'challenging': 'CHALLENGING',
    'expert': 'EXPERT',
  }[difficulty] : undefined;

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
        {adventureType && (
          <div className={styles.badge}>
            {adventureType.toUpperCase()}
          </div>
        )}
        {distance !== undefined && (
          <div className={styles.distance}>
            {distance.toFixed(1)} MI
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <span>📍</span>
            <span>{location}</span>
          </div>
          <div className={styles.metaItem}>
            <span>🏙</span>
            <span>{city}</span>
          </div>
        </div>

        {description && (
          <p className={styles.description}>{description}</p>
        )}

        <div className={styles.details}>
          {difficulty && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>DIFFICULTY</span>
              <span className={styles.detailValue}>{difficultyLabel}</span>
            </div>
          )}
          {duration && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>DURATION</span>
              <span className={styles.detailValue}>{duration}H</span>
            </div>
          )}
          {priceRange && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>PRICE</span>
              <span className={styles.detailValue}>{priceRange}</span>
            </div>
          )}
        </div>

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
        <button className={styles.button} type="button">
          EXPLORE
        </button>
      </div>
    </Link>
  );
};

AdventureCard.displayName = 'AdventureCard';
