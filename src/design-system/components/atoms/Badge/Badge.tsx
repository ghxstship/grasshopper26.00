/**
 * Badge Component
 * GHXSTSHIP Entertainment Platform - Geometric status badges
 * Thick borders, BEBAS NEUE text, geometric containers
 */

import * as React from "react"
import styles from "./Badge.module.css"

export type BadgeVariant = 'default' | 'outlined' | 'filled' | 'sold-out' | 'on-sale' | 'coming-soon';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', children, className = '', ...props }, ref) => {
    const classNames = [
      styles.badge,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ');
  
  return (
    <span ref={ref} className={classNames} {...props}>
      {children}
    </span>
  );
});

Badge.displayName = "Badge";
