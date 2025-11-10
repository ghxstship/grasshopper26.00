'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { CartItem, CartItemData } from '@/design-system/components/molecules/CartItem';
import styles from './CartSidebar.module.css';

interface CartSidebarProps {
  isOpen: boolean;
  items: CartItemData[];
  onClose: () => void;
  onEditItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  items,
  onClose,
  onEditItem,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className={styles.card}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full bg-white shadow-2xl transition-transform duration-300 sm:w-[500px]',
          'flex flex-col border-l-3 border-black',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className={styles.row}>
          <h2 className={styles.container}>YOUR ADVANCE</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.row}
            aria-label="Close cart"
          >
            <X className={styles.icon} />
          </button>
        </div>

        {/* Subheader */}
        <div className={styles.container}>
          <p className={styles.text}>
            {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
          </p>
        </div>

        {/* Cart Items */}
        <div className={styles.container}>
          {items.length === 0 ? (
            <div className={styles.row}>
              <GeometricIcon name="cart" size="xl" className={styles.text} />
              <p className={styles.text}>
                Your advance request is empty
              </p>
              <p className={styles.text}>
                Browse the catalog to add items
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-grey-200">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onEdit={() => onEditItem(item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.card}>
            <button
              type="button"
              onClick={onProceedToCheckout}
              className={styles.row}
            >
              PROCEED TO DETAILS
              <GeometricIcon name="arrow-right" size="md" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
