/**
 * DropdownMenu Component
 * GHXSTSHIP Entertainment Platform - Dropdown Menu
 * Geometric menu with BEBAS NEUE labels
 */

import * as React from 'react';
import styles from './DropdownMenu.module.css';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ trigger, items, align = 'left', className = '' }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

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

    const handleItemClick = (item: MenuItem) => {
      if (!item.disabled && item.onClick) {
        item.onClick();
        setIsOpen(false);
      }
    };

    const containerClassNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const menuClassNames = [
      styles.menu,
      styles[align],
      isOpen && styles.open,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        <div
          className={styles.trigger}
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {trigger}
        </div>

        <div ref={menuRef} className={menuClassNames} role="menu">
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.divider ? (
                <div className={styles.divider} role="separator" />
              ) : (
                <button
                  className={`${styles.item} ${item.disabled ? styles.disabled : ''}`}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  role="menuitem"
                >
                  {item.icon && <span className={styles.icon}>{item.icon}</span>}
                  <span className={styles.label}>{item.label}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
);

DropdownMenu.displayName = 'DropdownMenu';
