'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { CartItem, CartItemData } from '@/design-system/components/molecules/CartItem';

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
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
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
        <div className="flex items-center justify-between border-b-3 border-white bg-black p-6 text-white">
          <h2 className="font-anton text-2xl uppercase">YOUR ADVANCE</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-white hover:text-black"
            aria-label="Close cart"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Subheader */}
        <div className="border-b-2 border-grey-200 bg-grey-50 px-6 py-3">
          <p className="font-share-tech-mono text-xs uppercase text-grey-700">
            {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <GeometricIcon name="cart" size="xl" className="mb-4 text-grey-400" />
              <p className="mb-2 font-share-tech text-grey-700">
                Your advance request is empty
              </p>
              <p className="font-share-tech-mono text-xs text-grey-600">
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
          <div className="border-t-3 border-black bg-white p-6">
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="flex w-full items-center justify-center gap-2 border-3 border-black bg-black px-6 py-4 font-bebas-neue text-lg uppercase text-white transition-colors hover:bg-white hover:text-black"
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
