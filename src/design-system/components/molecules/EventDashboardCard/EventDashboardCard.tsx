'use client';

import React from 'react';
import Link from 'next/link';
import styles from './EventDashboardCard.module.css';

export interface EventDashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const EventDashboardCard: React.FC<EventDashboardCardProps> = ({
  title,
  value,
  subtitle,
  href,
  trend,
  trendValue,
  className,
}) => {
  const content = (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {trend && trendValue && (
          <span className={`${styles.trend} ${styles[trend]}`}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
            {trendValue}
          </span>
        )}
      </div>
      
      <div className={styles.value}>{value}</div>
      
      {subtitle && (
        <div className={styles.subtitle}>{subtitle}</div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
};

EventDashboardCard.displayName = 'EventDashboardCard';
