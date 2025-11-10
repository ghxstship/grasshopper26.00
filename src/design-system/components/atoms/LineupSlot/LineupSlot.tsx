/**
 * LineupSlot Component
 * GHXSTSHIP Entertainment Platform - Festival lineup time slot
 * BEBAS NEUE artist with SHARE TECH MONO time
 */

import * as React from 'react';
import styles from './LineupSlot.module.css';

export type LineupSlotSize = 'sm' | 'md' | 'lg';

export interface LineupSlotProps {
  artist: string;
  time: string;
  stage?: string;
  isHeadliner?: boolean;
  size?: LineupSlotSize;
  className?: string;
}

export const LineupSlot = React.forwardRef<HTMLDivElement, LineupSlotProps>(
  (
    {
      artist,
      time,
      stage,
      isHeadliner = false,
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const containerClassNames = [
      styles.slot,
      styles[size],
      isHeadliner && styles.headliner,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        <div className={styles.timeBlock}>
          <span className={styles.time}>{time}</span>
          {stage && (
            <span className={styles.stage}>{stage}</span>
          )}
        </div>
        
        <div className={styles.artistBlock}>
          <span className={styles.artist}>{artist}</span>
        </div>
      </div>
    );
  }
);

LineupSlot.displayName = 'LineupSlot';
