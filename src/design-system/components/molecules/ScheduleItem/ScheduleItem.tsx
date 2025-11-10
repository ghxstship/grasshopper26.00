/**
 * ScheduleItem Component
 * GHXSTSHIP Entertainment Platform - Timetable Grid Item
 * Excel-style grid layout with thick grid lines (2px)
 */

import * as React from 'react';
import styles from './ScheduleItem.module.css';

export interface ScheduleItemProps {
  artist: string;
  stage: string;
  startTime: string;
  endTime: string;
  isHighlighted?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ScheduleItem = React.forwardRef<HTMLDivElement, ScheduleItemProps>(
  ({ artist, stage, startTime, endTime, isHighlighted = false, onClick, className = '' }, ref) => {
    const classNames = [
      styles.item,
      isHighlighted && styles.highlighted,
      onClick && styles.clickable,
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
        aria-label={onClick ? `${artist} at ${stage}, ${startTime} to ${endTime}` : undefined}
      >
        <div className={styles.timeRange}>
          <span className={styles.time}>{startTime}</span>
          <span className={styles.timeSeparator}>-</span>
          <span className={styles.time}>{endTime}</span>
        </div>
        
        <div className={styles.artistName}>
          {artist}
        </div>
        
        <div className={styles.stageName}>
          {stage}
        </div>
      </div>
    );
  }
);

ScheduleItem.displayName = 'ScheduleItem';
