/**
 * Badge - Status/label indicator atom
 * GHXSTSHIP Atomic Design System
 */

import { ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  /** Children content */
  children: ReactNode;
  /** Badge variant */
  variant?: 'default' | 'outline' | 'solid';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const classNames = [
    styles.badge,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classNames}>{children}</span>;
}
