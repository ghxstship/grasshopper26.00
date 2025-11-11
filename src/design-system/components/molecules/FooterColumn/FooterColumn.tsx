import * as React from 'react';
import Link from 'next/link';
import styles from './FooterColumn.module.css';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumnProps {
  title: string;
  links: readonly FooterLink[];
  className?: string;
}

/**
 * FooterColumn - Footer navigation column
 * Atomic design molecule for footer link groups
 */
export const FooterColumn: React.FC<FooterColumnProps> = ({ title, links, className = '' }) => {
  return (
    <div className={`${styles.column} ${className}`}>
      <h3 className={styles.title}>{title}</h3>
      <nav aria-label={`${title} links`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.link}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
