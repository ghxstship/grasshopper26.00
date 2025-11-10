'use client';

import React from 'react';
import styles from './StatsSection.module.css';

export interface Stat {
  value: string | number;
  label: string;
  description?: string;
  icon?: string;
}

export interface StatsSectionProps {
  /** Section title */
  title?: string;
  /** Statistics to display */
  stats: Stat[];
  /** Color variant */
  variant?: 'black' | 'white';
  /** Additional CSS class */
  className?: string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  title,
  stats,
  variant = 'black',
  className = '',
}) => {
  const sectionClasses = [
    styles.section,
    variant === 'white' && styles.white,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClasses}>
      <div className={styles.container}>
        {title && <h2 className={styles.title}>{title}</h2>}

        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.stat}>
              {stat.icon && <div className={styles.icon}>{stat.icon}</div>}
              <div className={styles.value}>{stat.value}</div>
              <div className={styles.label}>{stat.label}</div>
              {stat.description && (
                <div className={styles.description}>{stat.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

StatsSection.displayName = 'StatsSection';
