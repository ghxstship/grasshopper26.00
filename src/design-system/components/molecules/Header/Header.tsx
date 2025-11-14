/**
 * Header - Site header molecule
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Button, Stack, Text } from '../../atoms';
import styles from './Header.module.css';

export interface HeaderProps {
  /** Logo text */
  logoText?: string;
  /** Navigation items */
  navItems?: Array<{ label: string; href: string }>;
  /** Show auth buttons */
  showAuth?: boolean;
  /** Current user */
  user?: { name: string } | null;
}

export function Header({
  logoText = 'GVTEWAY',
  navItems = [],
  showAuth = true,
  user,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box as="header" className={styles.header} border borderWidth={3}>
      <Box className={styles.container}>
        <Stack direction="horizontal" align="center" justify="between" gap={4}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <Text font="anton" size="2xl" uppercase>
              {logoText}
            </Text>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            <Stack direction="horizontal" gap={6}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={styles.navLink}>
                  <Text font="bebas" size="lg" uppercase>
                    {item.label}
                  </Text>
                </Link>
              ))}
            </Stack>
          </nav>

          {/* Auth Buttons */}
          {showAuth && (
            <Stack direction="horizontal" gap={3} className={styles.auth}>
              {user ? (
                <Link href="/member">
                  <Text font="bebas" size="lg">
                    {user.name}
                  </Text>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </Stack>
          )}

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Text font="bebas" size="xl">
              {mobileMenuOpen ? '✕' : '☰'}
            </Text>
          </button>
        </Stack>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className={styles.mobileNav}>
            <Stack gap={4}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={styles.mobileNavLink}>
                  <Text font="bebas" size="xl" uppercase>
                    {item.label}
                  </Text>
                </Link>
              ))}
            </Stack>
          </nav>
        )}
      </Box>
    </Box>
  );
}
