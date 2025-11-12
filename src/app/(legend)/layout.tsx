'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import styles from './layout.module.css';

const LEGEND_NAV_ITEMS = [
  { label: 'ORGANIZATIONS', href: '/organizations' },
  { label: 'VENUES', href: '/venues' },
  { label: 'VENDORS', href: '/vendors' },
  { label: 'STAFF', href: '/staff' },
  { label: 'OPERATIONS', href: '/organization' },
] as const;

function LegendNav() {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    return pathname?.startsWith(href);
  };

  return (
    <nav className={styles.nav}>
      {LEGEND_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function LegendDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.container}>
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            GVTEWAY
          </Link>
          <span className={styles.portalLabel}>LEGEND</span>
        </div>
        <LegendNav />
      </aside>

      {isMobileMenuOpen && (
        <button 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
