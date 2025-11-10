'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export interface HeaderProps {
  /** Logo text or brand name */
  logoText?: string;
  /** Logo link destination */
  logoHref?: string;
  /** Navigation items */
  navItems?: Array<{
    label: string;
    href: string;
  }>;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaHref?: string;
  /** Inverted color scheme (black background) */
  inverted?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Header Organism - GHXSTSHIP Design System
 * 
 * Fixed navigation header with:
 * - ANTON logo typography
 * - BEBAS NEUE navigation items
 * - Thick 3px borders
 * - Color inversion hover effects
 * - Mobile hamburger menu with full-screen overlay
 * - Geometric animations
 * 
 * @example
 * ```tsx
 * <Header
 *   logoText="GVTEWAY"
 *   logoHref="/"
 *   navItems={[
 *     { label: 'EVENTS', href: '/events' },
 *     { label: 'ARTISTS', href: '/artists' },
 *     { label: 'TICKETS', href: '/tickets' },
 *   ]}
 *   ctaText="GET TICKETS"
 *   ctaHref="/tickets"
 * />
 * ```
 */
export const Header: React.FC<HeaderProps> = ({
  logoText = 'GVTEWAY',
  logoHref = '/',
  navItems = [
    { label: 'EVENTS', href: '/events' },
    { label: 'ARTISTS', href: '/artists' },
    { label: 'TICKETS', href: '/tickets' },
    { label: 'NEWS', href: '/news' },
  ],
  ctaText = 'GET TICKETS',
  ctaHref = '/tickets',
  inverted = false,
  className = '',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const headerClasses = [
    styles.header,
    inverted && styles.inverted,
    scrolled && styles.scrolled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header className={headerClasses}>
        <div className={styles.container}>
          <Link href={logoHref} className={styles.logo}>
            {logoText}
          </Link>

          <nav className={styles.nav}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href={ctaHref} className={styles.ctaButton}>
              {ctaText}
            </Link>
          </nav>

          <button
            className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.open : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        </div>
      </header>

      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
            {item.label}
          </Link>
        ))}
        <Link href={ctaHref} className={styles.ctaButton} onClick={closeMobileMenu}>
          {ctaText}
        </Link>
      </div>
    </>
  );
};

Header.displayName = 'Header';
