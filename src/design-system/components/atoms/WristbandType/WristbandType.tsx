/**
 * WristbandType Component
 * GHXSTSHIP Entertainment Platform - Wristband type indicator
 * Geometric badge for ticket tier visualization
 */

import * as React from 'react';
import styles from './WristbandType.module.css';

export type WristbandTier = 'ga' | 'vip' | 'platinum' | 'artist';
export type WristbandTypeSize = 'sm' | 'md' | 'lg';

export interface WristbandTypeProps {
  tier: WristbandTier;
  size?: WristbandTypeSize;
  className?: string;
}

const tierLabels: Record<WristbandTier, string> = {
  ga: 'GA',
  vip: 'VIP',
  platinum: 'PLATINUM',
  artist: 'ARTIST',
};

export const WristbandType = React.forwardRef<HTMLSpanElement, WristbandTypeProps>(
  (
    {
      tier,
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.wristband,
      styles[size],
      styles[tier],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classNames}>
        {tierLabels[tier]}
      </span>
    );
  }
);

WristbandType.displayName = 'WristbandType';
