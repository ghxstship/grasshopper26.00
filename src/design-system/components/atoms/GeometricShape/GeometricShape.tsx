/**
 * GeometricShape - Hard geometric shape primitive
 * GHXSTSHIP Atomic Design System
 */

import styles from './GeometricShape.module.css';

export interface GeometricShapeProps {
  /** Shape variant */
  variant?: 'square' | 'rectangle' | 'triangle' | 'diamond' | 'circle' | 'hexagon' | string;
  /** Shape name (alias for variant) */
  name?: 'square' | 'rectangle' | 'triangle' | 'diamond' | 'circle' | 'hexagon' | string;
  /** Size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Fill color */
  filled?: boolean;
  /** Additional className */
  className?: string;
}

export function GeometricShape({
  variant,
  name,
  size = 'md',
  filled = false,
  className,
}: GeometricShapeProps) {
  // Support both variant and name props
  const shapeType = variant || name || 'square';
  const classNames = [
    styles.shape,
    styles[shapeType],
    styles[`size-${size}`],
    filled && styles.filled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames} />;
}
