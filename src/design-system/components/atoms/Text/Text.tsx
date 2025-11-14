/**
 * Text - Typography primitive
 * GHXSTSHIP Atomic Design System
 */

import { ElementType, ReactNode } from 'react';
import styles from './Text.module.css';

export interface TextProps {
  /** Element type to render */
  as?: 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Children content */
  children: ReactNode;
  /** Font family */
  font?: 'anton' | 'bebas' | 'share' | 'share-mono';
  /** Font size */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text color */
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand' | 'accent';
  /** Text align */
  align?: 'start' | 'center' | 'end';
  /** Line height */
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed';
  /** Letter spacing */
  letterSpacing?: 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  /** Uppercase */
  uppercase?: boolean;
  /** Additional className */
  className?: string;
  /** ID for accessibility */
  id?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export function Text({
  as: Component = 'p',
  children,
  font = 'share',
  size = 'base',
  weight,
  color = 'primary',
  align,
  lineHeight,
  letterSpacing,
  uppercase,
  className,
  ...props
}: TextProps) {
  const classNames = [
    styles.text,
    styles[`font-${font}`],
    styles[`size-${size}`],
    weight && styles[`weight-${weight}`],
    styles[`color-${color}`],
    align && styles[`align-${align}`],
    lineHeight && styles[`lh-${lineHeight}`],
    letterSpacing && styles[`ls-${letterSpacing}`],
    uppercase && styles.uppercase,
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
