/**
 * AdminSidebar - Admin navigation sidebar
 * GHXSTSHIP Design System
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';

export interface AdminSidebarProps {
  className?: string;
}

const navItems = [
  { label: 'Dashboard', href: '/organization/dashboard', icon: '📊' },
  { label: 'Events', href: '/organization/events', icon: '🎪' },
  { label: 'Orders', href: '/organization/orders', icon: '🎫' },
  { label: 'Artists', href: '/organization/artists', icon: '🎤' },
  { label: 'Brands', href: '/organization/brands', icon: '🏢' },
  { label: 'Products', href: '/organization/products', icon: '🛍️' },
  { label: 'Inventory', href: '/organization/inventory', icon: '📦' },
  { label: 'Budgets', href: '/organization/budgets', icon: '💰' },
  { label: 'Contracts', href: '/organization/contracts', icon: '📄' },
  { label: 'Equipment', href: '/organization/equipment', icon: '🔧' },
  { label: 'Advances', href: '/organization/advances', icon: '💵' },
  { label: 'Marketing', href: '/organization/marketing', icon: '📣' },
  { label: 'Credentials', href: '/organization/credentials', icon: '🎟️' },
  { label: 'Users', href: '/organization/users', icon: '👥' },
  { label: 'Roles', href: '/organization/roles', icon: '🔐' },
  { label: 'Settings', href: '/organization/settings', icon: '⚙️' },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={`${styles.sidebar} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>GVTEWAY ADMIN</h2>
      </div>
      <ul className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
