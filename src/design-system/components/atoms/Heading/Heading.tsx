/**
 * Heading - Semantic heading primitive
 * GHXSTSHIP Atomic Design System
 */

import { ReactNode } from 'react';
import styles from './Heading.module.css';

export interface HeadingProps {
  /** Heading level */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Children content */
  children: ReactNode;
  /** Font family - defaults to BEBAS NEUE for headings */
  font?: 'anton' | 'bebas';
  /** Text align */
  align?: 'start' | 'center' | 'end';
  /** Additional className */
  className?: string;
  /** ID for accessibility */
  id?: string;
}

export function Heading({
  level,
  children,
  font = 'bebas',
  align,
  className,
  ...props
}: HeadingProps) {
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const classNames = [
    styles.heading,
    styles[`h${level}`],
    styles[`font-${font}`],
    align && styles[`align-${align}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classNames} {...props}>
      {children}
    </Component>
  );
}
