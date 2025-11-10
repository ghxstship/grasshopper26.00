/**
 * HalftoneOverlay Component
 * GHXSTSHIP Entertainment Platform - Ben-Day dot pattern overlay
 * For texture without color on images
 */

import * as React from 'react';
import styles from './HalftoneOverlay.module.css';

export type HalftonePattern = 'dots' | 'diagonal' | 'grid' | 'screen-print';
export type HalftoneSize = 'sm' | 'md' | 'lg';

export interface HalftoneOverlayProps {
  pattern?: HalftonePattern;
  size?: HalftoneSize;
  opacity?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

export const HalftoneOverlay = React.forwardRef<HTMLDivElement, HalftoneOverlayProps>(
  (
    {
      pattern = 'dots',
      size = 'md',
      opacity = 0.3,
      className = '',
      'aria-hidden': ariaHidden = true,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.overlay,
      styles[pattern],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    const style: React.CSSProperties = {
      opacity,
    };

    return (
      <div
        ref={ref}
        className={classNames}
        style={style}
        aria-hidden={ariaHidden}
        {...props}
      />
    );
  }
);

HalftoneOverlay.displayName = 'HalftoneOverlay';
