/**
 * PortalSidebar Organism
 * GHXSTSHIP Design System
 * Navigation sidebar for member portal
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Ticket, 
  Heart, 
  Calendar, 
  Gift, 
  CreditCard,
  User,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import styles from './PortalSidebar.module.css';

export interface PortalSidebarProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/member/dashboard', icon: <LayoutDashboard /> },
  { label: 'Orders', href: '/member/orders', icon: <ShoppingBag /> },
  { label: 'Tickets', href: '/member/schedule', icon: <Ticket /> },
  { label: 'Favorites', href: '/member/favorites', icon: <Heart /> },
  { label: 'Calendar', href: '/member/schedule', icon: <Calendar /> },
  { label: 'Credits', href: '/member/credits', icon: <CreditCard /> },
  { label: 'Vouchers', href: '/member/vouchers', icon: <Gift /> },
  { label: 'Referrals', href: '/member/referrals', icon: <TrendingUp /> },
  { label: 'Advances', href: '/member/advances', icon: <DollarSign /> },
  { label: 'Profile', href: '/member/profile', icon: <User /> },
];

export function PortalSidebar({ className }: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className={`${styles.sidebar} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>MEMBER PORTAL</h2>
      </div>
      <ul className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
