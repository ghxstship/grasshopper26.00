/**
 * NavigationItem Component
 * GHXSTSHIP Entertainment Platform - Navigation Menu Item
 * BEBAS NEUE uppercase menu items with thick underline hover effects
 */

import * as React from 'react';
import Link from 'next/link';
import styles from './NavigationItem.module.css';

export interface NavigationItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  external?: boolean;
}

export const NavigationItem = React.forwardRef<HTMLAnchorElement, NavigationItemProps>(
  ({ href, label, isActive = false, onClick, className = '', external = false }, ref) => {
    const classNames = [
      styles.navItem,
      isActive && styles.active,
      className,
    ].filter(Boolean).join(' ');

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick();
      }
    };

    const linkProps = external
      ? {
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {};

    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={classNames}
          onClick={handleClick}
          {...linkProps}
        >
          <span className={styles.label}>{label}</span>
          <span className={styles.underline} aria-hidden="true" />
        </a>
      );
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={classNames}
        onClick={handleClick}
      >
        <span className={styles.label}>{label}</span>
        <span className={styles.underline} aria-hidden="true" />
      </Link>
    );
  }
);

NavigationItem.displayName = 'NavigationItem';
