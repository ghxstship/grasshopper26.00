/**
 * PortalSidebar Organism
 * GHXSTSHIP Monochromatic Design System
 */
'use client';

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Typography } from '../../atoms/Typography/Typography';
import { 
  LayoutDashboard, 
  Ticket, 
  CreditCard,
  Gift,
  Calendar,
  User,
  Settings
} from 'lucide-react';
import styles from './PortalSidebar.module.css';

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/orders', label: 'Orders', icon: Ticket },
  { href: '/portal/advances', label: 'Advances', icon: CreditCard },
  { href: '/portal/credits', label: 'Credits', icon: Gift },
  { href: '/portal/vouchers', label: 'Vouchers', icon: Gift },
  { href: '/portal/referrals', label: 'Referrals', icon: User },
];

export const PortalSidebar: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <nav className={styles.sidebar}>
      <div className={styles.header}>
        <Typography variant="h3" as="div">
          GVTEWAY
        </Typography>
        <Typography variant="meta" as="div" className={styles.subtitle}>
          Member Portal
        </Typography>
      </div>
      
      <ul className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
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
