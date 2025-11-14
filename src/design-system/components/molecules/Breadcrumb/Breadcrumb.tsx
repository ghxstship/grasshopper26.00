/**
 * Breadcrumb - Navigation breadcrumb molecule
 * GHXSTSHIP Atomic Design System
 */

import Link from 'next/link';
import { Stack, Text } from '../../atoms';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  <Text font="share" size="sm" uppercase>
                    {item.label}
                  </Text>
                </Link>
              ) : (
                <Text font="share" size="sm" uppercase color={isLast ? 'primary' : 'secondary'}>
                  {item.label}
                </Text>
              )}
              {!isLast && (
                <span className={styles.separator}>
                  <Text font="bebas" color="tertiary">/</Text>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
