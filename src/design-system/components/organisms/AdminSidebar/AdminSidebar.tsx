/**
 * AdminSidebar Organism
 * GHXSTSHIP Monochromatic Design System
 */
'use client';

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Typography } from '../../atoms/Typography/Typography';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Ticket, 
  Package, 
  BarChart3,
  Settings,
  Crown
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/orders', label: 'Orders', icon: Ticket },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/roles', label: 'Roles', icon: Crown },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <nav className={styles.sidebar}>
      <div className={styles.header}>
        <Typography variant="h3" as="div">
          GVTEWAY
        </Typography>
        <Typography variant="meta" as="div" className={styles.subtitle}>
          Admin
        </Typography>
      </div>
      
      <ul className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
