'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart, CartItem } from '@/lib/store/cart-store';
import { ShoppingCart, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddToCartButtonProps {
  item: Omit<CartItem, 'quantity'>;
  quantity?: number;
  disabled?: boolean;
}

export function AddToCartButton({ item, quantity = 1, disabled }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({ ...item, quantity });
    setAdded(true);
    
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });

    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || added}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
    >
      {added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
