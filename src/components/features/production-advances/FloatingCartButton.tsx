'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { GeometricIcon } from '@/design-system/components/atoms/GeometricIcon';
import { cn } from '@/lib/utils';

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
      className={cn(
        'fixed bottom-8 right-8 z-30',
        'flex items-center gap-3',
        'border-3 border-black bg-black px-6 py-4',
        'font-bebas-neue text-lg uppercase text-white',
        'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
        'transition-all duration-200',
        'hover:bg-white hover:text-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]',
        'active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        className
      )}
      aria-label={`View cart with ${itemCount} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden sm:inline">ADVANCE CART</span>
      <span className="inline sm:hidden">CART</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
        {itemCount}
      </span>
      <GeometricIcon name="arrow-right" size="md" className="hidden sm:inline" />
    </button>
  );
};
