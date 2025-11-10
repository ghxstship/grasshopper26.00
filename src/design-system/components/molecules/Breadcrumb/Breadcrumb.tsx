/**
 * Breadcrumb Component
 * GHXSTSHIP Entertainment Platform - Navigation Breadcrumb
 * SHARE TECH MONO with geometric separators
 */

import * as React from 'react';
import Link from 'next/link';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  className?: string;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '//', className = '' }, ref) => {
    const classNames = [
      styles.breadcrumb,
      className,
    ].filter(Boolean).join(' ');

    return (
      <nav ref={ref} className={classNames} aria-label="Breadcrumb">
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className={styles.item}>
                {item.href && !isLast ? (
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
                
                {!isLast && (
                  <span className={styles.separator} aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
