'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../../atoms/Button';
import styles from './site-header.module.css';

export interface SiteHeaderProps {
  className?: string;
}

const NAV_ITEMS = [
  { label: 'ARTISTS', href: '/artists' },
  { label: 'TICKETS', href: '/tickets' },
  { label: 'NEWS', href: '/news' },
] as const;

/**
 * SiteHeader - Main navigation header for GVTEWAY
 * Composed using atomic design principles with Button atoms
 * GHXSTSHIP monochromatic design with BEBAS NEUE typography
 */
export const SiteHeader: React.FC<SiteHeaderProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${className}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="GVTEWAY Home">
            GVTEWAY
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/tickets" className={styles.ctaButton}>
              GET TICKETS
            </Link>
          </nav>

          <button
            className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.open : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true">
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.active : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/tickets"
              className={styles.mobileCta}
              onClick={() => setMobileMenuOpen(false)}
            >
              GET TICKETS
            </Link>
          </nav>
        </div>
      )}
    </>
  );
};
