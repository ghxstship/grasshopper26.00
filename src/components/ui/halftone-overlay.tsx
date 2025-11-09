/**
 * Halftone Overlay Component
 * Applies Ben-Day dots overlay to images for GHXSTSHIP design system
 */

'use client';

import { cn } from '@/lib/utils';
import { getHalftoneStyles, HALFTONE_PRESETS } from '@/lib/imageProcessing/halftone';

interface HalftoneOverlayProps {
  preset?: keyof typeof HALFTONE_PRESETS;
  color?: string;
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Halftone overlay component - place over images
 */
export function HalftoneOverlay({
  preset = 'medium',
  color = '#000000',
  opacity = 0.3,
  className,
  children,
}: HalftoneOverlayProps) {
  const styles = getHalftoneStyles({ preset, color, opacity });

  return (
    <div className={cn('relative', className)}>
      {children}
      <div
        className="absolute inset-0 pointer-events-none"
        style={styles}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Stripe pattern overlay (alternative to halftone)
 */
interface StripeOverlayProps {
  angle?: number;
  color?: string;
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

export function StripeOverlay({
  angle = 45,
  color = '#000000',
  opacity = 0.1,
  className,
  children,
}: StripeOverlayProps) {
  const STRIPE_WIDTH = 2;
  const SPACING = 10;
  
  return (
    <div className={cn('relative', className)}>
      {children}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            ${angle}deg,
            ${color},
            ${color} ${STRIPE_WIDTH}px,
            transparent ${STRIPE_WIDTH}px,
            transparent ${SPACING}px
          )`,
          opacity,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Grid overlay pattern
 */
interface GridOverlayProps {
  spacing?: number;
  lineWidth?: number;
  color?: string;
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

export function GridOverlay({
  spacing = 20,
  lineWidth = 1,
  color = '#000000',
  opacity = 0.1,
  className,
  children,
}: GridOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${color} ${lineWidth}px, transparent ${lineWidth}px),
            linear-gradient(90deg, ${color} ${lineWidth}px, transparent ${lineWidth}px)
          `,
          backgroundSize: `${spacing}px ${spacing}px`,
          opacity,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Preset configurations for easy use
 */
export const OVERLAY_PRESETS = {
  subtle: {
    preset: 'fine' as const,
    opacity: 0.2,
  },
  medium: {
    preset: 'medium' as const,
    opacity: 0.3,
  },
  strong: {
    preset: 'coarse' as const,
    opacity: 0.4,
  },
  popArt: {
    preset: 'popArt' as const,
    opacity: 0.5,
  },
};
