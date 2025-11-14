/**
 * Stack - Vertical/Horizontal layout primitive
 * GHXSTSHIP Atomic Design System
 */

import type { ReactNode, CSSProperties } from 'react';
import styles from './Stack.module.css';

export interface StackProps {
  /** Children content */
  children: ReactNode;
  /** Direction */
  direction?: 'vertical' | 'horizontal';
  /** Gap between items */
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Justify */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** Wrap items */
  wrap?: boolean;
  /** Additional className */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function Stack({
  children,
  direction = 'vertical',
  gap = 4,
  align,
  justify,
  wrap,
  className,
  style,
  ...props
}: StackProps) {
  const classNames = [
    styles.stack,
    styles[`direction-${direction}`],
    styles[`gap-${gap}`],
    align && styles[`align-${align}`],
    justify && styles[`justify-${justify}`],
    wrap && styles.wrap,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} style={style} {...props}>
      {children}
    </div>
  );
}
