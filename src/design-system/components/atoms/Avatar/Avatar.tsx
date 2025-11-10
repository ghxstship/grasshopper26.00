/**
 * Avatar Component
 * GHXSTSHIP Entertainment Platform - Artist/user avatars
 * Geometric frames (square), B&W images with halftone overlay option
 */

import * as React from 'react';
import Image from 'next/image';
import styles from './Avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: AvatarSize;
  fallback?: string;
  className?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      size = 'md',
      fallback,
      className = '',
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    const classNames = [
      styles.avatar,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    const displayFallback = !src || imageError;
    const fallbackText = fallback || alt.charAt(0).toUpperCase();

    return (
      <div ref={ref} className={classNames}>
        {!displayFallback ? (
          <>
            <Image
              src={src}
              alt={alt}
              fill
              className={styles.image}
              onError={() => setImageError(true)}
            />
            <div className={styles.halftoneOverlay} aria-hidden="true" />
          </>
        ) : (
          <div className={styles.fallback}>
            {fallbackText}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Compound component exports for compatibility with Radix-style usage
export const AvatarImage = ({ src, alt, ...props }: { src?: string; alt: string } & React.ImgHTMLAttributes<HTMLImageElement>) => {
  if (!src) return null;
  return <img src={src} alt={alt} {...props} />;
};

export const AvatarFallback = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

AvatarImage.displayName = 'AvatarImage';
AvatarFallback.displayName = 'AvatarFallback';
