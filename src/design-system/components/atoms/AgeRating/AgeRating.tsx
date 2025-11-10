/**
 * AgeRating Component
 * GHXSTSHIP Entertainment Platform - Event age rating badge
 * Geometric badge for age restrictions
 */

import * as React from 'react';
import styles from './AgeRating.module.css';

export type AgeRatingType = '18+' | '21+' | 'all-ages';
export type AgeRatingSize = 'sm' | 'md' | 'lg';

export interface AgeRatingProps {
  rating: AgeRatingType;
  size?: AgeRatingSize;
  className?: string;
}

const ratingLabels: Record<AgeRatingType, string> = {
  '18+': '18+',
  '21+': '21+',
  'all-ages': 'ALL AGES',
};

export const AgeRating = React.forwardRef<HTMLSpanElement, AgeRatingProps>(
  (
    {
      rating,
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.rating,
      styles[size],
      styles[rating],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classNames}>
        {ratingLabels[rating]}
      </span>
    );
  }
);

AgeRating.displayName = 'AgeRating';
