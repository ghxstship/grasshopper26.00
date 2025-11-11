'use client';

import { SplitLayout } from '@/design-system/components/templates/SplitLayout/SplitLayout';
import { SiteHeader } from '@/design-system/components/organisms/layout/site-header';
import { SiteFooter } from '@/design-system/components/organisms/layout/site-footer';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { PriceDisplay } from '@/design-system/components/atoms/PriceDisplay/PriceDisplay';
import { Badge } from '@/design-system/components/atoms/Badge/Badge';
import { Divider } from '@/design-system/components/atoms/Divider/Divider';
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
      header={<SiteHeader />}
      left={
        <div className={styles.cartContent}>
          <div className={styles.header}>
            <Typography variant="h2" as="h1">
              Shopping Cart
            </Typography>
            {items && items.length > 0 && (
              <Badge variant="filled">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </Badge>
            )}
          </div>
          
          {loading ? (
            <div className={styles.loading}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeletonItem}>
                  <Skeleton variant="rectangular" height="120px" />
                </div>
              ))}
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
                    <Typography variant="h4" as="h3">
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography variant="body" as="p" className={styles.itemDescription}>
                        {item.description}
                      </Typography>
                    )}
                    {item.variant && (
                      <Typography variant="body" as="p" className={styles.itemVariant}>
                        {item.variant}
                      </Typography>
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
                        <Minus style={{ width: 16, height: 16 }} />
                      </button>
                      <Typography variant="body" as="span" className={styles.quantity}>
                        {item.quantity}
                      </Typography>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className={styles.quantityButton}
                        aria-label="Increase quantity"
                      >
                        <Plus style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                    <PriceDisplay amount={item.price * item.quantity} size="md" />
                    {removeItem && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className={styles.removeButton}
                        aria-label="Remove item"
                      >
                        <Trash2 style={{ width: 20, height: 20 }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <ShoppingCart className={styles.emptyIcon} />
              <Typography variant="h3" as="p">Your cart is empty</Typography>
              <Typography variant="body" as="p">
                Browse events and shop to add items
              </Typography>
              <Link href="/events">
                <Button variant="filled" size="lg">Browse Events</Button>
              </Link>
            </div>
          )}
        </div>
      }
      right={
        <div className={styles.summary}>
          <Typography variant="h3" as="h2">
            Order Summary
          </Typography>
          
          <Divider />
          
          {loading ? (
            <div className={styles.summarySkeleton}>
              <Skeleton variant="text" height="24px" />
              <Skeleton variant="text" height="24px" />
              <Skeleton variant="text" height="32px" />
            </div>
          ) : (
            <>
              <div className={styles.summaryRow}>
                <Typography variant="body" as="div">Subtotal</Typography>
                <PriceDisplay amount={subtotal || 0} size="sm" />
              </div>
              
              {tax !== undefined && tax > 0 && (
                <div className={styles.summaryRow}>
                  <Typography variant="body" as="div">Tax</Typography>
                  <PriceDisplay amount={tax} size="sm" />
                </div>
              )}
              
              <Divider />
              
              <div className={styles.summaryTotal}>
                <Typography variant="h4" as="div">Total</Typography>
                <PriceDisplay amount={total || 0} size="lg" />
              </div>
              
              <Link href="/checkout">
                <Button 
                  variant="filled" 
                  fullWidth 
                  size="lg"
                  disabled={!items || items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </Link>
              
              <Link href="/events">
                <Button variant="outlined" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
            </>
          )}
        </div>
      }
      footer={<SiteFooter />}
      ratio="60-40"
      stickySide="right"
    />
  );
}
