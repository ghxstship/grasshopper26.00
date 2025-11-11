'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const LEGEND_NAV_ITEMS = [
  { label: 'DASHBOARD', href: '/legend' },
  { label: 'ORGANIZATIONS', href: '/legend/organizations' },
  { label: 'VENUES', href: '/legend/venues' },
  { label: 'VENDORS', href: '/legend/vendors' },
  { label: 'BUDGETS', href: '/legend/budgets' },
  { label: 'TASKS', href: '/legend/tasks' },
  { label: 'OPERATIONS', href: '/organization' },
] as const;

function LegendNav() {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href === '/legend') {
      return pathname === '/legend';
    }
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
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            GVTEWAY
          </Link>
          <span className={styles.portalLabel}>LEGEND</span>
        </div>
        <LegendNav />
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
