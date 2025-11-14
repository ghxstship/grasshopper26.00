/**
 * Link - Styled link atom
 * GHXSTSHIP Atomic Design System
 */

import NextLink from 'next/link';
import { ReactNode } from 'react';
import styles from './Link.module.css';

export interface LinkProps {
  /** Link href */
  href: string;
  /** Children content */
  children: ReactNode;
  /** Link variant */
  variant?: 'default' | 'underline' | 'button';
  /** External link */
  external?: boolean;
  /** Additional className */
  className?: string;
}

export function Link({
  href,
  children,
  variant = 'default',
  external,
  className,
}: LinkProps) {
  const classNames = [
    styles.link,
    styles[`variant-${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (external) {
    return (
      <a
        href={href}
        className={classNames}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={classNames}>
      {children}
    </NextLink>
  );
}
