/**
 * ArtistCard Component
 * GHXSTSHIP Entertainment Platform - Artist Display Card
 * High-contrast B&W photos with halftone overlay, circular or square geometric frames
 */

import * as React from 'react';
import Image from 'next/image';
import styles from './ArtistCard.module.css';

export interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    genre: string[];
    imageUrl: string;
    socialLinks?: {
      spotify?: string;
      instagram?: string;
      twitter?: string;
      soundcloud?: string;
    };
  };
  onClick?: () => void;
  variant?: 'circle' | 'square';
  className?: string;
}

export const ArtistCard = React.forwardRef<HTMLDivElement, ArtistCardProps>(
  ({ artist, onClick, variant = 'square', className = '' }, ref) => {
    const classNames = [
      styles.card,
      styles[variant],
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
      <div
        ref={ref}
        className={classNames}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `View ${artist.name} profile` : undefined}
      >
        <div className={styles.imageFrame}>
          <div className={styles.imageContainer}>
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            <div className={styles.halftoneOverlay} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.content}>
          <h3 className={styles.name}>
            {artist.name}
          </h3>
          
          {artist.genre && artist.genre.length > 0 && (
            <div className={styles.genreTags}>
              {artist.genre.map((genre, index) => (
                <span key={index} className={styles.genreTag}>
                  {genre}
                </span>
              ))}
            </div>
          )}

          {artist.socialLinks && (
            <div className={styles.socialLinks}>
              {artist.socialLinks.spotify && (
                <a
                  href={artist.socialLinks.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={`${artist.name} on Spotify`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className={styles.socialIcon}>♫</span>
                </a>
              )}
              {artist.socialLinks.instagram && (
                <a
                  href={artist.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={`${artist.name} on Instagram`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className={styles.socialIcon}>◉</span>
                </a>
              )}
              {artist.socialLinks.twitter && (
                <a
                  href={artist.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={`${artist.name} on Twitter`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className={styles.socialIcon}>◆</span>
                </a>
              )}
              {artist.socialLinks.soundcloud && (
                <a
                  href={artist.socialLinks.soundcloud}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={`${artist.name} on SoundCloud`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className={styles.socialIcon}>◈</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ArtistCard.displayName = 'ArtistCard';
