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
  Crown,
  DollarSign,
  FileText,
  Wrench,
  CheckSquare,
  Megaphone
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const navItems = [
  { href: '/organization', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/organization/events', label: 'Events', icon: Calendar },
  { href: '/organization/products', label: 'Products', icon: Package },
  { href: '/organization/orders', label: 'Orders', icon: Ticket },
  { href: '/organization/users', label: 'Users', icon: Users },
  { href: '/organization/budgets', label: 'Budgets', icon: DollarSign },
  { href: '/organization/contracts', label: 'Contracts', icon: FileText },
  { href: '/organization/equipment', label: 'Equipment', icon: Wrench },
  { href: '/organization/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/organization/marketing', label: 'Marketing', icon: Megaphone },
  { href: '/organization/roles', label: 'Roles', icon: Crown },
  { href: '/organization/settings', label: 'Settings', icon: Settings },
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
