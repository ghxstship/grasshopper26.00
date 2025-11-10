'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Settings, UserCircle } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { toast } from 'sonner';
import styles from './UserMenu.module.css';

export interface UserMenuProps {
  userEmail?: string;
  userName?: string;
  onSignOut: () => Promise<void>;
  className?: string;
}

/**
 * UserMenu - User account dropdown menu
 * Atomic molecule composed of Button atoms
 * GHXSTSHIP monochromatic design with geometric dropdown
 */
export const UserMenu: React.FC<UserMenuProps> = ({ 
  userEmail,
  userName,
  onSignOut,
  className = '' 
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await onSignOut();
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Failed to sign out');
    }
    setIsOpen(false);
  };

  const displayName = userName || userEmail?.split('@')[0] || 'User';

  return (
    <div className={`${styles.userMenu} ${className}`} ref={menuRef}>
      <Button
        variant="ghost"
        size="md"
        iconOnly={<UserCircle size={24} />}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.menuButton}
      />

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.userInfo}>
            <div className={styles.userName}>{displayName}</div>
            {userEmail && <div className={styles.userEmail}>{userEmail}</div>}
          </div>

          <div className={styles.divider} />

          <Link 
            href="/portal" 
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            <LayoutDashboard size={18} />
            <span>Portal</span>
          </Link>

          <Link 
            href="/profile" 
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          <Link 
            href="/profile/settings" 
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
            role="menuitem"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>

          <div className={styles.divider} />

          <button 
            className={`${styles.menuItem} ${styles.signOut}`}
            onClick={handleSignOut}
            role="menuitem"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
