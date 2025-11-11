'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const PORTAL_NAV_ITEMS = [
  { label: 'DASHBOARD', href: '/portal' },
  { label: 'EVENTS', href: '/portal/events' },
  { label: 'ORGANIZATIONS', href: '/portal/organizations' },
  { label: 'TASKS', href: '/portal/tasks' },
  { label: 'BUDGETS', href: '/portal/budgets' },
  { label: 'VENUES', href: '/portal/venues' },
  { label: 'VENDORS', href: '/portal/vendors' },
  { label: 'ANALYTICS', href: '/portal/analytics' },
] as const;

function PortalNav() {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href === '/portal') {
      return pathname === '/portal';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className={styles.nav}>
      {PORTAL_NAV_ITEMS.map((item) => (
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

export default function PortalLayout({
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
          <span className={styles.portalLabel}>PORTAL</span>
        </div>
        <PortalNav />
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
