'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import { useCart } from '@/lib/store/cart-store';
import Link from 'next/link';
import styles from './cart-button.module.css';

export function CartButton() {
  const itemCount = useCart((state) => state.getItemCount());

  return (
    <Link href="/cart">
      <Button variant="outline" className={styles.button}>
        <ShoppingCart className={styles.icon} />
        {itemCount > 0 && (
          <span className={styles.badge}>
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
