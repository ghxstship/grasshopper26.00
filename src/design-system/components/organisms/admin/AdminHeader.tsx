'use client';

import { User } from '@supabase/supabase-js';
import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './AdminHeader.module.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AdminHeaderProps {
  user: User;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      {/* Search */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            type="search"
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Right side */}
      <div className={styles.rightSection}>
        {/* Notifications */}
        <Button variant="ghost" size="icon" className={styles.notificationButton}>
          <Bell className={styles.notificationIcon} />
          <span className={styles.notificationBadge} />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={styles.userButton}>
              <div className={styles.avatar}>
                <UserIcon className={styles.avatarIcon} />
              </div>
              <span className={styles.userName}>
                {user.user_metadata?.name || user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={styles.menuContent}>
            <DropdownMenuLabel>
              <div className={styles.menuLabel}>
                <p className={styles.menuUserName}>
                  {user.user_metadata?.name || 'Admin User'}
                </p>
                <p className={styles.menuUserEmail}>{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
              <UserIcon className={styles.menuIcon} />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className={styles.menuItemDanger}>
              <LogOut className={styles.menuIcon} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
