/**
 * Card - Container primitive
 * GHXSTSHIP Atomic Design System
 */

import { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Children content */
  children: ReactNode;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Padding */
  padding?: 0 | 2 | 4 | 6 | 8;
  /** Interactive (hover effects) */
  interactive?: boolean;
  /** Additional className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Inline styles */
  style?: React.CSSProperties;
}

export function Card({
  children,
  variant = 'default',
  padding = 6,
  interactive,
  className,
  onClick,
  style,
  ...props
}: CardProps) {
  const classNames = [
    styles.card,
    styles[`variant-${variant}`],
    styles[`padding-${padding}`],
    interactive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={classNames} 
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  const classNames = [styles.title, className].filter(Boolean).join(' ');
  return (
    <h3 className={classNames}>
      {children}
    </h3>
  );
}

export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  const classNames = [styles.description, className].filter(Boolean).join(' ');
  return (
    <p className={classNames}>
      {children}
    </p>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
