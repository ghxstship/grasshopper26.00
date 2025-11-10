/**
 * Typography Component
 * GHXSTSHIP Monochromatic Design System
 * 
 * Variants:
 * - hero: ANTON (uppercase, tight line height)
 * - h1-h6: ANTON (h1), BEBAS NEUE (h2-h6) - all uppercase
 * - body: SHARE TECH
 * - meta: SHARE TECH MONO
 * 
 * Zero tolerance for hardcoded values - uses design tokens exclusively
 */

import React from 'react';
import styles from './Typography.module.css';

export type TypographyVariant = 
  | 'hero'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'body-lg'
  | 'body-sm'
  | 'meta'
  | 'meta-sm';

export type TypographyAlign = 'start' | 'center' | 'end';

export type TypographyColor = 
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'brand'
  | 'accent';

export interface TypographyProps {
  /** Typography variant */
  variant?: TypographyVariant;
  
  /** HTML element to render */
  as?: keyof JSX.IntrinsicElements;
  
  /** Text alignment */
  align?: TypographyAlign;
  
  /** Text color */
  color?: TypographyColor;
  
  /** Force uppercase (automatic for hero and headings) */
  uppercase?: boolean;
  
  /** Children content */
  children: React.ReactNode;
  
  /** Additional CSS class */
  className?: string;
  
  /** Inline styles (discouraged - use className instead) */
  style?: React.CSSProperties;
  
  /** ARIA label */
  'aria-label'?: string;
  
  /** ARIA level for headings */
  'aria-level'?: number;
  
  /** ID for linking */
  id?: string;
}

/**
 * Default HTML elements for each variant
 */
const defaultElements: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
  hero: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  'body-lg': 'p',
  'body-sm': 'p',
  meta: 'span',
  'meta-sm': 'span',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  align = 'start',
  color = 'primary',
  uppercase,
  children,
  className = '',
  style,
  'aria-label': ariaLabel,
  'aria-level': ariaLevel,
  id,
}) => {
  const Component = as || defaultElements[variant];
  
  // Auto-uppercase for hero and headings (GHXSTSHIP requirement)
  const shouldUppercase = uppercase ?? ['hero', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(variant);
  
  const classNames = [
    styles.typography,
    styles[variant],
    styles[`align-${align}`],
    styles[`color-${color}`],
    shouldUppercase && styles.uppercase,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <Component
      className={classNames}
      style={style}
      aria-label={ariaLabel}
      aria-level={ariaLevel}
      id={id}
    >
      {children}
    </Component>
  );
};

// Convenience components for common use cases
export const Hero: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="hero" {...props} />
);

export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const H5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const H6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
);

export const Body: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body" {...props} />
);

export const Meta: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="meta" {...props} />
);
