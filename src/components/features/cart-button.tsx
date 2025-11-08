'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/store/cart-store';
import Link from 'next/link';

export function CartButton() {
  const itemCount = useCart((state) => state.getItemCount());

  return (
    <Link href="/cart">
      <Button variant="outline" className="relative border-purple-500/30 hover:bg-purple-500/10">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
