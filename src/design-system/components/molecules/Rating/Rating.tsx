/**
 * Rating Component
 * GHXSTSHIP Entertainment Platform - Star Rating
 * Geometric star rating display and input
 */

import * as React from 'react';
import styles from './Rating.module.css';

export interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      max = 5,
      onChange,
      readonly = false,
      size = 'md',
      showValue = false,
      className = '',
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const handleClick = (rating: number) => {
      if (!readonly && onChange) {
        onChange(rating);
      }
    };

    const handleMouseEnter = (rating: number) => {
      if (!readonly) {
        setHoverValue(rating);
      }
    };

    const handleMouseLeave = () => {
      setHoverValue(null);
    };

    const containerClassNames = [
      styles.rating,
      styles[size],
      !readonly && styles.interactive,
      className,
    ].filter(Boolean).join(' ');

    const displayValue = hoverValue !== null ? hoverValue : value;

    return (
      <div ref={ref} className={containerClassNames} role={readonly ? undefined : 'radiogroup'}>
        <div className={styles.stars} onMouseLeave={handleMouseLeave}>
          {Array.from({ length: max }).map((_, index) => {
            const rating = index + 1;
            const isFilled = rating <= displayValue;

            return (
              <button
                key={index}
                className={`${styles.star} ${isFilled ? styles.filled : ''}`}
                onClick={() => handleClick(rating)}
                onMouseEnter={() => handleMouseEnter(rating)}
                disabled={readonly}
                aria-label={`Rate ${rating} out of ${max}`}
                role={readonly ? undefined : 'radio'}
                aria-checked={readonly ? undefined : rating === value}
                type="button"
              >
                <span className={styles.starIcon} aria-hidden="true">
                  ★
                </span>
              </button>
            );
          })}
        </div>

        {showValue && (
          <span className={styles.value}>
            {value.toFixed(1)} / {max}
          </span>
        )}
      </div>
    );
  }
);

Rating.displayName = 'Rating';
