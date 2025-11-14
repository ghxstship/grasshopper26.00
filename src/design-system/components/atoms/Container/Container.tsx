/**
 * Container - Max-width container atom
 * GHXSTSHIP Atomic Design System
 */

import { ReactNode } from 'react';
import styles from './Container.module.css';

export interface ContainerProps {
  /** Children content */
  children: ReactNode;
  /** Max width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Center content */
  center?: boolean;
  /** Additional className */
  className?: string;
}

export function Container({
  children,
  maxWidth = 'xl',
  center = true,
  className,
}: ContainerProps) {
  const classNames = [
    styles.container,
    styles[`maxWidth-${maxWidth}`],
    center && styles.center,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames}>{children}</div>;
}
