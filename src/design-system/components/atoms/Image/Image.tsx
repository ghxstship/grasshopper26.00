/**
 * Image - Optimized image atom
 * GHXSTSHIP Atomic Design System
 */

import NextImage from 'next/image';
import styles from './Image.module.css';

export interface ImageProps {
  /** Image source */
  src: string;
  /** Alt text */
  alt: string;
  /** Width */
  width?: number;
  /** Height */
  height?: number;
  /** Fill container */
  fill?: boolean;
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill';
  /** Priority loading */
  priority?: boolean;
  /** Sizes attribute */
  sizes?: string;
  /** Additional className */
  className?: string;
}

export function Image({
  src,
  alt,
  width,
  height,
  fill,
  objectFit = 'cover',
  priority,
  sizes,
  className,
}: ImageProps) {
  const classNames = [
    styles.image,
    styles[`fit-${objectFit}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        className={classNames}
        priority={priority}
        sizes={sizes}
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={classNames}
      priority={priority}
      sizes={sizes}
    />
  );
}
