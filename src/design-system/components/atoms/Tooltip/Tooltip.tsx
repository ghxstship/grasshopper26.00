/**
 * Tooltip Component
 * GHXSTSHIP Entertainment Platform - Geometric tooltip
 * Hard-edge slide-in, thick borders
 */

'use client';

import * as React from 'react';
import styles from './Tooltip.module.css';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const containerClassNames = [
    styles.container,
    className,
  ].filter(Boolean).join(' ');

  const tooltipClassNames = [
    styles.tooltip,
    styles[position],
    isVisible && styles.visible,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClassNames}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={tooltipClassNames} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
};
