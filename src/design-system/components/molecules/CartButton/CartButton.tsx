'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import styles from './CartButton.module.css';

export interface CartButtonProps {
  itemCount?: number;
  className?: string;
}

/**
 * CartButton - Shopping cart button with item count badge
 * Atomic molecule composed of Button atom
 * GHXSTSHIP monochromatic design
 */
export const CartButton: React.FC<CartButtonProps> = ({ 
  itemCount = 0, 
  className = '' 
}) => {
  return (
    <Link href="/cart" className={`${styles.cartLink} ${className}`}>
      <Button
        variant="ghost"
        size="md"
        iconOnly={<ShoppingCart size={20} />}
        aria-label={`Shopping cart with ${itemCount} items`}
        className={styles.cartButton}
      />
      {itemCount > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};
