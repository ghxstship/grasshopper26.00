'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator character */
  separator?: string;
  /** Additional CSS class */
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = '/',
  className = '',
}) => {
  return (
    <nav className={`${styles.breadcrumbs} ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className={styles.item}>
            {item.href && !isLast ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && <span className={styles.separator}>{separator}</span>}
          </div>
        );
      })}
    </nav>
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';
