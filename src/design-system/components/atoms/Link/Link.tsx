/**
 * Link Component
 * GHXSTSHIP Entertainment Platform - Geometric links
 * Thick underline hover effects, BEBAS NEUE for nav links
 */

import * as React from 'react';
import NextLink from 'next/link';
import styles from './Link.module.css';

export type LinkVariant = 'default' | 'nav' | 'underline' | 'button';
export type LinkSize = 'sm' | 'md' | 'lg';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  variant?: LinkVariant;
  size?: LinkSize;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      variant = 'default',
      size = 'md',
      external = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.link,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    const externalProps = external
      ? {
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {};

    if (external || href.startsWith('http')) {
      return (
        <a
          ref={ref}
          href={href}
          className={classNames}
          {...externalProps}
          {...props}
        >
          {children}
          {external && <span className={styles.externalIcon} aria-hidden="true">↗</span>}
        </a>
      );
    }

    return (
      <NextLink
        ref={ref}
        href={href}
        className={classNames}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';
