'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ArtistCard.module.css';

export interface ArtistCardProps {
  /** Artist name */
  name: string;
  /** Artist image URL */
  imageUrl: string;
  /** Artist image alt text */
  imageAlt?: string;
  /** Artist link */
  href: string;
  /** Artist genres/tags */
  genres?: string[];
  /** Artist bio */
  bio?: string;
  /** Social media links */
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  /** Upcoming shows */
  upcomingShows?: Array<{
    event: string;
    date: string;
  }>;
  /** Badge text (e.g., "HEADLINER", "FEATURED") */
  badge?: string;
  /** Image frame shape */
  frameShape?: 'circular' | 'square';
  /** Card variant */
  variant?: 'default' | 'compact' | 'horizontal';
  /** Additional CSS class */
  className?: string;
}

/**
 * ArtistCard Organism - GHXSTSHIP Design System
 * 
 * Artist card component with:
 * - High-contrast B&W artist photos with halftone overlay
 * - BEBAS NEUE artist names
 * - SHARE TECH MONO genre tags
 * - Circular or square geometric frames
 * - Custom B&W geometric social media icons
 * - Scale animation on hover
 * 
 * @example
 * ```tsx
 * <ArtistCard
 *   name="ARMIN VAN BUUREN"
 *   imageUrl="/artists/armin.jpg"
 *   href="/artists/armin-van-buuren"
 *   genres={['TRANCE', 'PROGRESSIVE']}
 *   frameShape="circular"
 *   socialLinks={[
 *     { platform: 'Instagram', url: 'https://instagram.com/arminvanbuuren', icon: 'IG' },
 *   ]}
 * />
 * ```
 */
export const ArtistCard: React.FC<ArtistCardProps> = ({
  name,
  imageUrl,
  imageAlt,
  href,
  genres = [],
  bio,
  socialLinks = [],
  upcomingShows = [],
  badge,
  frameShape = 'circular',
  variant = 'default',
  className = '',
}) => {
  const cardClasses = [
    styles.card,
    variant === 'compact' && styles.compact,
    variant === 'horizontal' && styles.horizontal,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const imageContainerClasses = [
    styles.imageContainer,
    frameShape === 'circular' && styles.circular,
    frameShape === 'square' && styles.square,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link href={href} className={cardClasses}>
      <div className={imageContainerClasses}>
        <Image
          src={imageUrl}
          alt={imageAlt || name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={styles.halftoneOverlay} />
        {badge && <div className={styles.badge}>{badge}</div>}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>

        {genres.length > 0 && (
          <div className={styles.genres}>{genres.join(' // ')}</div>
        )}

        {bio && variant !== 'compact' && (
          <p className={styles.bio}>{bio}</p>
        )}

        {socialLinks.length > 0 && (
          <div className={styles.social}>
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                onClick={(e) => e.stopPropagation()}
              >
                {link.icon}
              </a>
            ))}
          </div>
        )}

        {upcomingShows.length > 0 && variant === 'horizontal' && (
          <div className={styles.upcomingShows}>
            <h4 className={styles.upcomingTitle}>UPCOMING SHOWS</h4>
            <div className={styles.showsList}>
              {upcomingShows.map((show, index) => (
                <div key={index} className={styles.showItem}>
                  {show.event} {'//'} {show.date}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

ArtistCard.displayName = 'ArtistCard';
