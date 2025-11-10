/**
 * StatCard Molecule
 * GHXSTSHIP Monochromatic Design System
 */

import * as React from "react";
import { Typography } from '../../atoms/Typography/Typography';
import styles from './StatCard.module.css';

export interface StatCardProps {
  /** Stat label */
  label: string;
  
  /** Stat value */
  value: string | number;
  
  /** Icon */
  icon?: React.ReactNode;
  
  /** Trend indicator */
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  
  /** Click handler */
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={`${styles.card} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className={styles.header}>
        <Typography variant="meta" as="div" className={styles.label}>
          {label}
        </Typography>
        {icon && (
          <div className={styles.icon}>
            {icon}
          </div>
        )}
      </div>
      
      <Typography variant="h2" as="div" className={styles.value}>
        {value}
      </Typography>
      
      {trend && (
        <div className={`${styles.trend} ${styles[trend.direction]}`}>
          <span className={styles.trendArrow}>
            {trend.direction === 'up' ? '↑' : '↓'}
          </span>
          <span className={styles.trendLabel}>
            {trend.label || `${trend.value}%`}
          </span>
        </div>
      )}
    </Component>
  );
};
