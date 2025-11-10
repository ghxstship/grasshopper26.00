'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './EventCard.module.css';

export interface EventCardProps {
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Event image URL */
  imageUrl: string;
  /** Event image alt text */
  imageAlt?: string;
  /** Event date */
  date: string;
  /** Event location/venue */
  location: string;
  /** Event link */
  href: string;
  /** Ticket price (starting from) */
  price?: string;
  /** Event status badge */
  badge?: 'sold-out' | 'on-sale' | 'coming-soon';
  /** Event tags/genres */
  tags?: string[];
  /** Card variant */
  variant?: 'default' | 'compact' | 'featured';
  /** Additional CSS class */
  className?: string;
}

/**
 * EventCard Organism - GHXSTSHIP Design System
 * 
 * Event card component with:
 * - High-contrast B&W imagery with grayscale filter
 * - BEBAS NEUE event titles
 * - SHARE TECH MONO date/location metadata
 * - Thick 3px borders
 * - Hard geometric shadows on hover
 * - Scale animation on hover
 * - Status badges (SOLD OUT, ON SALE)
 * 
 * @example
 * ```tsx
 * <EventCard
 *   title="ELECTRIC DAISY CARNIVAL"
 *   description="The world's premier electronic music festival"
 *   imageUrl="/events/edc.jpg"
 *   date="MAY 17-19, 2025"
 *   location="LAS VEGAS MOTOR SPEEDWAY"
 *   href="/events/edc"
 *   price="FROM $399"
 *   badge="on-sale"
 *   tags={['FESTIVAL', 'EDM', '3-DAY']}
 * />
 * ```
 */
export const EventCard: React.FC<EventCardProps> = ({
  title,
  description,
  imageUrl,
  imageAlt,
  date,
  location,
  href,
  price,
  badge,
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

  const badgeText = badge ? {
    'sold-out': 'SOLD OUT',
    'on-sale': 'ON SALE',
    'coming-soon': 'COMING SOON',
  }[badge] : undefined;

  const badgeClass = badge === 'sold-out' ? styles.soldOut : styles.onSale;

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
        {badge && (
          <div className={`${styles.badge} ${badgeClass}`}>
            {badgeText}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.metadata}>
          <div className={styles.metaItem}>
            <span>📅</span>
            <span>{date}</span>
          </div>
          <div className={styles.metaItem}>
            <span>📍</span>
            <span>{location}</span>
          </div>
        </div>

        {description && (
          <p className={styles.description}>{description}</p>
        )}

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

      {(price || badge !== 'sold-out') && (
        <div className={styles.footer}>
          {price && (
            <div>
              <span className={styles.priceLabel}>TICKETS</span>
              <div className={styles.price}>{price}</div>
            </div>
          )}
          {badge !== 'sold-out' && (
            <button className={styles.button} type="button">
              VIEW EVENT
            </button>
          )}
        </div>
      )}
    </Link>
  );
};

EventCard.displayName = 'EventCard';
