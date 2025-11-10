'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ShoppingBag, 
  Ticket, 
  BarChart3, 
  Settings,
  Package,
  Layers,
  FileText,
  Boxes
} from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './AdminSidebar.module.css';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Artists', href: '/admin/artists', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
  { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Bulk Operations', href: '/admin/bulk-operations', icon: Layers },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.header}>
        <h1 className={styles.logo}>GVTEWAY Admin</h1>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                styles.navLink,
                isActive && styles.navLinkActive
              )}
            >
              <item.icon className={cn(
                styles.navIcon,
                isActive && styles.navIconActive
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          GVTEWAY 26.00
        </p>
      </div>
    </div>
  );
}
