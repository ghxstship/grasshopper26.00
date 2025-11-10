/**
 * Avatar Component
 * GHXSTSHIP Entertainment Platform - User Avatar
 * Geometric frames with B&W images
 */

import * as React from 'react';
import Image from 'next/image';
import styles from './Avatar.module.css';

export interface AvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away';
  className?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', variant = 'circle', status, className = '' }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const containerClassNames = [
      styles.avatar,
      styles[size],
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    const showFallback = !src || imageError;
    const initials = fallback ? getInitials(fallback) : alt.slice(0, 2).toUpperCase();

    return (
      <div ref={ref} className={containerClassNames}>
        {!showFallback && src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={styles.image}
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, 200px"
          />
        ) : (
          <div className={styles.fallback}>
            <span className={styles.initials}>{initials}</span>
          </div>
        )}

        {status && (
          <span
            className={`${styles.status} ${styles[`status-${status}`]}`}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
