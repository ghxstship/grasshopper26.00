/**
 * Grid - CSS Grid layout primitive
 * GHXSTSHIP Atomic Design System
 */

import { ReactNode } from 'react';
import styles from './Grid.module.css';

export interface GridProps {
  /** Children content */
  children: ReactNode;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Gap between items */
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
  /** Responsive columns */
  responsive?: boolean;
  /** Additional className */
  className?: string;
}

export function Grid({
  children,
  columns = 12,
  gap = 4,
  responsive = true,
  className,
}: GridProps) {
  const classNames = [
    styles.grid,
    styles[`columns-${columns}`],
    styles[`gap-${gap}`],
    responsive && styles.responsive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames}>{children}</div>;
}
