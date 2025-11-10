/**
 * GeometricShape Component
 * GHXSTSHIP Entertainment Platform - Decorative geometric shapes
 * Circles, squares, triangles for compositions
 */

import * as React from 'react';
import styles from './GeometricShape.module.css';

export type ShapeType = 'circle' | 'square' | 'triangle' | 'diamond' | 'alert' | 'clipboard' | 'arrow-right' | 'package' | string;
export type ShapeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GeometricShapeProps {
  type?: ShapeType;
  name?: ShapeType; // Alias for type
  size?: ShapeSize;
  filled?: boolean;
  rotationDegrees?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

export const GeometricShape = React.forwardRef<HTMLDivElement, GeometricShapeProps>(
  (
    {
      type,
      name,
      size = 'md',
      filled = false,
      rotationDegrees = 0,
      className = '',
      'aria-hidden': ariaHidden = true,
      ...props
    },
    ref
  ) => {
    // Use name as alias for type if provided
    const shapeType = name || type || 'circle';
    const classNames = [
      styles.shape,
      styles[shapeType],
      styles[size],
      filled && styles.filled,
      className,
    ].filter(Boolean).join(' ');

    const style: React.CSSProperties = {
      transform: rotationDegrees !== 0 ? `rotate(${rotationDegrees}deg)` : undefined,
    };

    return (
      <div
        ref={ref}
        className={classNames}
        style={style}
        aria-hidden={ariaHidden}
        {...props}
      />
    );
  }
);

GeometricShape.displayName = 'GeometricShape';
