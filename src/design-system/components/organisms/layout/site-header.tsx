'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CartButton } from '../../molecules/CartButton';
import { AuthButtons } from '../../molecules/AuthButtons';
import { UserMenu } from '../../molecules/UserMenu';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/useCart';
import { useTheme } from '@/hooks/use-theme';
import styles from './site-header.module.css';

export interface SiteHeaderProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'transparent';
}

const NAV_ITEMS = [
  { label: 'MUSIC', href: '/music', icon: '◆' },
  { label: 'EVENTS', href: '/events', icon: '◆' },
  { label: 'ADVENTURES', href: '/adventures', icon: '◆' },
  { label: 'SHOPS', href: '/shop', icon: '◆' },
  { label: 'NEWS', href: '/news', icon: '◆' },
] as const;

/**
 * SiteHeader - Next-Gen Navigation Header for GVTEWAY
 * INNOVATIVE FEATURES:
 * - Adaptive morphing layouts across breakpoints
 * - Magnetic hover interactions with geometric animations
 * - Scroll-reactive transformations (compress, expand, hide)
 * - Split navigation architecture for visual hierarchy
 * - Micro-interactions with hard geometric shadows
 * - Progressive disclosure patterns
 * 
 * GHXSTSHIP Design System: Monochromatic, hard-edged, bold typography
 * Atomic Design: Composed from Button, Link, and interaction atoms
 */
export const SiteHeader: React.FC<SiteHeaderProps> = ({ 
  className = '',
  variant = 'default'
}) => {
  const pathname = usePathname();
  const { user, loading: authLoading, signOut } = useAuth();
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrollState, setScrollState] = React.useState<'top' | 'scrolling' | 'scrolled'>('top');
  const [scrollDirection, setScrollDirection] = React.useState<'up' | 'down'>('up');
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { theme, cycleTheme, mounted } = useTheme();
  const lastScrollY = React.useRef(0);
  const headerRef = React.useRef<HTMLElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const cartItemCount = items?.length || 0;

  // Advanced scroll behavior with direction detection
  React.useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
          
          setScrollDirection(direction);
          
          if (currentScrollY < 10) {
            setScrollState('top');
          } else if (currentScrollY > 100) {
            setScrollState('scrolled');
          } else {
            setScrollState('scrolling');
          }
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Magnetic cursor effect for desktop
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth >= 1024) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Lock body scroll when mobile menu open
  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Theme is now managed by useTheme hook - no manual management needed

  // Search focus management and ESC handler
  React.useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query?.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const headerClasses = [
    styles.header,
    styles[`variant-${variant}`],
    styles[`scroll-${scrollState}`],
    styles[`direction-${scrollDirection}`],
    scrollState === 'scrolled' && scrollDirection === 'down' && styles.hidden,
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      <header 
        ref={headerRef}
        className={headerClasses}
        data-scroll-state={scrollState}
        data-scroll-direction={scrollDirection}
      >
        {/* Geometric accent line */}
        <div className={styles.accentLine} aria-hidden="true" />
        
        <div className={styles.container}>
          {/* Logo with geometric reveal animation */}
          <Link href="/" className={styles.logoWrapper} aria-label="GVTEWAY Home">
            <div className={styles.logoGeometric} aria-hidden="true">
              <span className={styles.logoSquare} />
              <span className={styles.logoSquare} />
              <span className={styles.logoSquare} />
            </div>
            <span className={styles.logo}>GVTEWAY</span>
            <div className={styles.logoUnderline} aria-hidden="true" />
          </Link>

          {/* Primary Navigation - Desktop Split Layout */}
          <nav className={styles.nav} aria-label="Main navigation">
            <div className={styles.navPrimary}>
              {NAV_ITEMS.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  data-label={item.label}
                >
                  <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navGeometric} aria-hidden="true" />
                </Link>
              ))}
            </div>
            
            <div className={styles.navSecondary}>
              {NAV_ITEMS.slice(3).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  data-label={item.label}
                >
                  <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navGeometric} aria-hidden="true" />
                </Link>
              ))}
              
              {/* CTA with magnetic effect */}
              <Link href="/membership" className={styles.ctaButton}>
                <span className={styles.ctaGeometric} aria-hidden="true" />
                <span className={styles.ctaLabel}>MEMBERSHIPS</span>
                <span className={styles.ctaShadow} aria-hidden="true" />
              </Link>
            </div>
          </nav>

          {/* Actions - Search, Theme, Cart & Auth */}
          <div className={styles.actions}>
            {/* Search Toggle */}
            <button
              className={styles.searchToggle}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              <span className={styles.searchIcon} aria-hidden="true">
                {searchOpen ? '✕' : '⌕'}
              </span>
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                className={styles.themeToggle}
                onClick={cycleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
                title={`Current: ${theme || 'system'}`}
              >
                <span className={styles.themeIcon} aria-hidden="true">
                  {theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '◐'}
                </span>
              </button>
            )}

            {/* Cart */}
            <div className={styles.cartWrapper}>
              <CartButton itemCount={cartItemCount} />
              {cartItemCount > 0 && (
                <span className={styles.cartPulse} aria-hidden="true" />
              )}
            </div>
            
            {/* Auth */}
            {!authLoading && (
              user ? (
                <div className={styles.userWrapper}>
                  <UserMenu
                    userEmail={user.email}
                    userName={user.user_metadata?.full_name}
                    onSignOut={signOut}
                  />
                </div>
              ) : (
                <div className={styles.authWrapper}>
                  <AuthButtons />
                </div>
              )
            )}
          </div>

          {/* Innovative Mobile Menu Button - Morphing Geometric */}
          <button
            className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.open : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className={styles.menuGeometric} aria-hidden="true">
              <span className={styles.menuLine} />
              <span className={styles.menuLine} />
              <span className={styles.menuLine} />
            </span>
            <span className={styles.menuLabel}>{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
          </button>
        </div>

        {/* Progress indicator for scroll */}
        <div 
          className={styles.scrollProgress} 
          style={{ 
            transform: `scaleX(${Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1)})` 
          }}
          aria-hidden="true"
        />
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                ref={searchInputRef}
                type="search"
                name="search"
                placeholder="SEARCH EVENTS, ARTISTS, VENUES..."
                className={styles.searchInput}
                autoComplete="off"
              />
              <button type="submit" className={styles.searchSubmit} aria-label="Search">
                <span aria-hidden="true">→</span>
              </button>
            </form>
            <div className={styles.searchHint}>
              <span className={styles.searchHintLabel}>PRESS ESC TO CLOSE</span>
            </div>
          </div>
        </div>
      )}

      {/* Innovative Mobile Menu - Full-screen Geometric Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className={styles.mobileOverlay} 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          <div className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label="Mobile navigation">
            {/* Geometric pattern background */}
            <div className={styles.mobilePattern} aria-hidden="true">
              <div className={styles.patternGrid} />
            </div>
            
            <nav className={styles.mobileNav}>
              {/* Primary nav items with staggered reveal */}
              <div className={styles.mobileNavPrimary}>
                {NAV_ITEMS.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.active : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className={styles.mobileNavNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.mobileNavLabel}>{item.label}</span>
                    <span className={styles.mobileNavIcon} aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>

              {/* CTA Section */}
              <div className={styles.mobileCtaSection}>
                <Link
                  href="/membership"
                  className={styles.mobileCta}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.mobileCtaGeometric} aria-hidden="true" />
                  <span className={styles.mobileCtaLabel}>MEMBERSHIPS</span>
                </Link>
              </div>

              {/* Auth Actions */}
              <div className={styles.mobileActions}>
                {!authLoading && (
                  user ? (
                    <div className={styles.mobileUserSection}>
                      <div className={styles.mobileUserInfo}>
                        <span className={styles.mobileUserLabel}>LOGGED IN AS</span>
                        <span className={styles.mobileUserEmail}>{user.email}</span>
                      </div>
                      
                      <div className={styles.mobileUserLinks}>
                        <Link
                          href="/portal"
                          className={styles.mobileUserLink}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span>◆</span> PORTAL
                        </Link>
                        <Link
                          href="/profile"
                          className={styles.mobileUserLink}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span>◆</span> PROFILE
                        </Link>
                      </div>
                      
                      <button
                        className={styles.mobileSignOut}
                        onClick={async () => {
                          await signOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        SIGN OUT
                      </button>
                    </div>
                  ) : (
                    <div className={styles.mobileAuthSection}>
                      <AuthButtons variant="vertical" />
                    </div>
                  )
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
};
