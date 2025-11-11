'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../../atoms/Button';
import { CartButton } from '../../molecules/CartButton';
import { AuthButtons } from '../../molecules/AuthButtons';
import { UserMenu } from '../../molecules/UserMenu';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/useCart';
import styles from './site-header.module.css';

export interface SiteHeaderProps {
  className?: string;
}

const NAV_ITEMS = [
  { label: 'EVENTS', href: '/events' },
  { label: 'ARTISTS', href: '/artists' },
  { label: 'SHOP', href: '/shop' },
  { label: 'NEWS', href: '/news' },
] as const;

/**
 * SiteHeader - Main navigation header for GVTEWAY
 * Composed using atomic design principles with Button atoms
 * GHXSTSHIP monochromatic design with BEBAS NEUE typography
 * Features: Auth state, shopping cart, user menu, responsive behavior
 */
export const SiteHeader: React.FC<SiteHeaderProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { user, loading: authLoading, signOut } = useAuth();
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const cartItemCount = items?.length || 0;

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
            <Link href="/memberships" className={styles.ctaButton}>
              MEMBERSHIPS
            </Link>
          </nav>

          <div className={styles.actions}>
            <CartButton itemCount={cartItemCount} />
            {!authLoading && (
              user ? (
                <UserMenu
                  userEmail={user.email}
                  userName={user.user_metadata?.full_name}
                  onSignOut={signOut}
                />
              ) : (
                <AuthButtons />
              )
            )}
          </div>

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
              href="/memberships"
              className={styles.mobileCta}
              onClick={() => setMobileMenuOpen(false)}
            >
              MEMBERSHIPS
            </Link>

            <div className={styles.mobileActions}>
              {!authLoading && (
                user ? (
                  <>
                    <Link
                      href="/portal"
                      className={styles.mobileNavLink}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      PORTAL
                    </Link>
                    <Link
                      href="/profile"
                      className={styles.mobileNavLink}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      PROFILE
                    </Link>
                    <button
                      className={styles.mobileSignOut}
                      onClick={async () => {
                        await signOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      SIGN OUT
                    </button>
                  </>
                ) : (
                  <AuthButtons variant="vertical" />
                )
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
