/**
 * Card Component
 * GHXSTSHIP Entertainment Platform - Geometric cards
 * Thick borders, hard geometric shadows, color inversion hover
 */

import * as React from "react"
import styles from "./Card.module.css"

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    padding = 'md',
    hoverable = false,
    clickable = false,
    className = '',
    children,
    ...props
  }, ref) => {
    const classNames = [
      styles.card,
      styles[variant],
      styles[`padding-${padding}`],
      hoverable && styles.hoverable,
      clickable && styles.clickable,
      className,
    ].filter(Boolean).join(' ');
    
    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`${styles.cardHeader} ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`${styles.cardBody} ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`${styles.cardFooter} ${className}`} {...props}>
    {children}
  </div>
);
