/**
 * Navigation Component
 * GHXSTSHIP Entertainment Platform - Fixed header navigation
 * BEBAS NEUE menu items, thick underline hover effects, geometric hamburger
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavigationProps {
  logo?: React.ReactNode;
  logoHref?: string;
  items: NavigationItem[];
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  variant?: 'black' | 'white';
  className?: string;
}

export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  (
    {
      logo,
      logoHref = '/',
      items,
      ctaText,
      ctaHref,
      onCtaClick,
      variant = 'black',
      className = '',
    },
    ref
  ) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
      setMobileMenuOpen(false);
    };

    React.useEffect(() => {
      if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [mobileMenuOpen]);

    const classNames = [
      styles.navigation,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <nav ref={ref} className={classNames} role="navigation">
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <Link href={logoHref} className={styles.logo} onClick={closeMobileMenu}>
              {logo || <span className={styles.logoText}>GVTEWAY</span>}
            </Link>
          </div>

          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`}>
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </span>
          </button>

          <div className={`${styles.menu} ${mobileMenuOpen ? styles.menuOpen : ''}`}>
            <ul className={styles.menuList}>
              {items.map((item, index) => (
                <li key={index} className={styles.menuItem}>
                  <Link
                    href={item.href}
                    className={`${styles.menuLink} ${item.active ? styles.menuLinkActive : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {ctaText && (
              <div className={styles.ctaContainer}>
                {ctaHref ? (
                  <Link href={ctaHref} className={styles.cta} onClick={closeMobileMenu}>
                    {ctaText}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      onCtaClick?.();
                    }}
                    className={styles.cta}
                  >
                    {ctaText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';
