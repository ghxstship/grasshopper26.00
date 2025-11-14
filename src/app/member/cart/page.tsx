'use client';

import { SplitLayout } from '@/design-system';
import { Heading, Text, Button, Badge, Divider, Spinner } from '@/design-system';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import styles from './cart.module.css';

export default function CartPage() {
  const { items, total, loading } = useCart();
  const subtotal = total * 0.9;
  const tax = total * 0.1;
  const updateQuantity = (id: string, qty: number) => {};
  const removeItem = (id: string) => {};

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = items?.find((i: any) => i.id === itemId);
    if (item && updateQuantity) {
      updateQuantity(itemId, Math.max(1, item.quantity + change));
    }
  };

  return (
    <SplitLayout
      header={null}
      left={
        <div className={styles.cartContent}>
          <div className={styles.header}>
            <Heading level={1} font="anton">
              Shopping Cart
            </Heading>
            {items && items.length > 0 && (
              <Badge variant="solid">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </Badge>
            )}
          </div>
          
          {loading ? (
            <div className={styles.loading}>
              <Spinner size="lg" />
              <Text>Loading cart...</Text>
            </div>
          ) : items && items.length > 0 ? (
            <div className={styles.itemsList}>
              {items.map((item: any) => (
                <div key={item.id} className={styles.cartItem}>
                  {item.image && (
                    <div className={styles.itemImage}>
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                  <div className={styles.itemDetails}>
                    <Heading level={4} font="bebas">
                      {item.name}
                    </Heading>
                    {item.description && (
                      <Text className={styles.itemDescription}>
                        {item.description}
                      </Text>
                    )}
                    {item.variant && (
                      <Text className={styles.itemVariant}>
                        {item.variant}
                      </Text>
                    )}
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className={styles.quantityButton}
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className={styles.iconSm} />
                      </button>
                      <Text className={styles.quantity}>
                        {item.quantity}
                      </Text>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className={styles.quantityButton}
                        aria-label="Increase quantity"
                      >
                        <Plus className={styles.iconSm} />
                      </button>
                    </div>
                    <Text weight="bold">${(item.price * item.quantity).toFixed(2)}</Text>
                    {removeItem && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className={styles.removeButton}
                        aria-label="Remove item"
                      >
                        <Trash2 className={styles.iconMd} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <ShoppingCart className={styles.emptyIcon} />
              <Heading level={3} font="bebas">Your cart is empty</Heading>
              <Text color="secondary">
                Browse events and shop to add items
              </Text>
              <Link href="/events">
                <Button variant="primary" size="lg">Browse Events</Button>
              </Link>
            </div>
          )}
        </div>
      }
      right={
        <div className={styles.summary}>
          <Heading level={3} font="bebas">
            Order Summary
          </Heading>
          
          <Divider />
          
          {loading ? (
            <div className={styles.summarySkeleton}>
              <Spinner size="md" />
            </div>
          ) : (
            <>
              <div className={styles.summaryRow}>
                <Text>Subtotal</Text>
                <Text weight="medium">${(subtotal || 0).toFixed(2)}</Text>
              </div>
              
              {tax !== undefined && tax > 0 && (
                <div className={styles.summaryRow}>
                  <Text>Tax</Text>
                  <Text weight="medium">${tax.toFixed(2)}</Text>
                </div>
              )}
              
              <Divider />
              
              <div className={styles.summaryTotal}>
                <Heading level={4} font="bebas">Total</Heading>
                <Text size="lg" weight="bold">${(total || 0).toFixed(2)}</Text>
              </div>
              
              <Link href="/checkout">
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  disabled={!items || items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </Link>
              
              <Link href="/events">
                <Button variant="secondary" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
            </>
          )}
        </div>
      }
      footer={null}
      ratio="60-40"
      stickySide="right"
    />
  );
}
