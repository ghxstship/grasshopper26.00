'use client';

import { useState } from 'react';
import { Button } from '@/design-system/components/atoms/button';
import { useCart, CartItem } from '@/lib/store/cart-store';
import { ShoppingCart, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import styles from './add-to-cart-button.module.css';

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
      className={styles.button}
    >
      {added ? (
        <>
          <Check className={styles.icon} />
          Added
        </>
      ) : (
        <>
          <ShoppingCart className={styles.icon} />
          Add to Cart
        </>
      )}
    </Button>
  );
}
