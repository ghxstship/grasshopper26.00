/**
 * Image Component
 * GHXSTSHIP Entertainment Platform - B&W image treatment
 * High-contrast B&W/duotone with optional halftone overlay
 */

'use client';

import * as React from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import styles from './Image.module.css';

export type ImageTreatment = 'bw' | 'duotone' | 'halftone' | 'none';

export interface ImageProps extends Omit<NextImageProps, 'className'> {
  treatment?: ImageTreatment;
  halftoneOpacity?: number;
  className?: string;
}

export const Image = React.forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      treatment = 'bw',
      halftoneOpacity = 0.2,
      className = '',
      alt,
      ...props
    },
    ref
  ) => {
    const containerClassNames = [
      styles.container,
      styles[treatment],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        <NextImage
          className={styles.image}
          alt={alt}
          {...props}
        />
        {(treatment === 'halftone' || treatment === 'bw') && (
          <div
            className={styles.halftoneOverlay}
            style={{ opacity: halftoneOpacity }}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';
