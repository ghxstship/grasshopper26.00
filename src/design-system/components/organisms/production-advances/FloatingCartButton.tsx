'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { cn } from '@/lib/utils';
import styles from './FloatingCartButton.module.css';

interface FloatingCartButtonProps {
  itemCount: number;
  onClick: () => void;
  className?: string;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  itemCount,
  onClick,
  className,
}) => {
  if (itemCount === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(styles.button, className)}
      aria-label={`View cart with ${itemCount} items`}
    >
      <ShoppingCart className={styles.icon} />
      <span className={styles.textFull}>ADVANCE CART</span>
      <span className={styles.textShort}>CART</span>
      <span className={styles.badge}>
        {itemCount}
      </span>
      <GeometricIcon name="arrow-right" size="md" className={styles.arrow} />
    </button>
  );
};
