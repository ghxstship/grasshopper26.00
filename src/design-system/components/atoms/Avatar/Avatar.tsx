/**
 * Avatar - User avatar atom
 * GHXSTSHIP Atomic Design System
 */

import { Image } from '../Image';
import styles from './Avatar.module.css';

export interface AvatarProps {
  /** Avatar image source */
  src?: string;
  /** Alt text */
  alt: string;
  /** Fallback text (initials) */
  fallback?: string;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}: AvatarProps) {
  const classNames = [
    styles.avatar,
    styles[`size-${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (src) {
    return (
      <div className={classNames}>
        <Image
          src={src}
          alt={alt}
          fill
          objectFit="cover"
        />
      </div>
    );
  }

  return (
    <div className={classNames}>
      <span className={styles.fallback}>
        {fallback || alt.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
