/**
 * Tooltip Component
 * GHXSTSHIP Entertainment Platform - Tooltip
 * SHARE TECH for tooltip text with geometric arrow
 */

import * as React from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, position = 'top', delay = 200, children, className = '' }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    };

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

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
        ref={ref}
        className={containerClassNames}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}
        <div className={tooltipClassNames} role="tooltip" aria-hidden={!isVisible}>
          {content}
          <div className={styles.arrow} />
        </div>
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';
