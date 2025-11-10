'use client';

/**
 * Site Header Component
 * Main navigation header for public-facing pages
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import styles from './site-header.module.css';

const navigation = [
  { name: 'Events', href: '/events' },
  { name: 'Artists', href: '/artists' },
  { name: 'Shop', href: '/shop' },
  { name: 'News', href: '/news' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.navContent}>
          {/* Logo */}
          <div className={styles.logoWrapper}>
            <Link href="/" className={styles.logoLink}>
              <span className={styles.logoText}>
                GVTEWAY
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav}>
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className={styles.searchButton}
              aria-label="Search"
            >
              <Search className={styles.icon} />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Shopping cart">
                <ShoppingCart className={styles.icon} />
              </Button>
            </Link>

            {/* User Menu */}
            <Link href="/portal/dashboard">
              <Button variant="ghost" size="icon" aria-label="User account">
                <User className={styles.icon} />
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className={styles.mobileMenuButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className={styles.iconLarge} />
              ) : (
                <Menu className={styles.iconLarge} />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={styles.mobileNav}>
            <div className={styles.mobileNavContent}>
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Search */}
              <button className={styles.mobileSearchButton}>
                <Search className={styles.icon} />
                <span>Search</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
