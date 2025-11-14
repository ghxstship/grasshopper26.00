/**
 * AdminHeader - Admin page header
 * GHXSTSHIP Design System
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../atoms';
import styles from './AdminHeader.module.css';

export interface AdminHeaderProps {
  className?: string;
}

export function AdminHeader({ className }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className={`${styles.header} ${className || ''}`}>
      <div className={styles.container}>
        <Link href="/organization/dashboard" className={styles.logo}>
          GVTEWAY
        </Link>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
