/**
 * Box - Foundational layout primitive
 * GHXSTSHIP Atomic Design System
 */

import { CSSProperties, ElementType, ReactNode } from 'react';
import styles from './Box.module.css';

export interface BoxProps {
  /** Element type to render */
  as?: ElementType;
  /** Children content */
  children?: ReactNode;
  /** Padding */
  p?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
  /** Padding inline */
  px?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
  /** Padding block */
  py?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
  /** Margin */
  m?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
  /** Margin inline */
  mx?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
  /** Margin block */
  my?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
  /** Background color */
  bg?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
  /** Border */
  border?: boolean;
  /** Border width */
  borderWidth?: 1 | 2 | 3;
  /** Additional className */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function Box({
  as: Component = 'div',
  children,
  p,
  px,
  py,
  m,
  mx,
  my,
  bg,
  border,
  borderWidth = 3,
  className,
  style,
  ...props
}: BoxProps) {
  const classNames = [
    styles.box,
    p !== undefined && styles[`p-${p}`],
    px !== undefined && styles[`px-${px}`],
    py !== undefined && styles[`py-${py}`],
    m !== undefined && styles[`m-${m}`],
    mx !== undefined && styles[`mx-${mx}`],
    my !== undefined && styles[`my-${my}`],
    bg && styles[`bg-${bg}`],
    border && styles.border,
    border && styles[`border-${borderWidth}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classNames} style={style} {...props}>
      {children}
    </Component>
  );
}
