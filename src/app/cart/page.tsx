'use client';

import { SplitLayout } from '@/design-system/components/templates/SplitLayout/SplitLayout';
import { SiteHeader } from '@/design-system/components/organisms/layout/site-header';
import { SiteFooter } from '@/design-system/components/organisms/layout/site-footer';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import styles from './cart.module.css';

export default function CartPage() {
  const { items, total, loading } = useCart();

  return (
    <SplitLayout
      header={<SiteHeader />}
      left={
        <div className={styles.cartContent}>
          <Typography variant="h2" as="h1">
            Shopping Cart
          </Typography>
          
          {loading ? (
            <div className={styles.loading}>
              <Typography variant="body" as="p">Loading cart...</Typography>
            </div>
          ) : items && items.length > 0 ? (
            <div className={styles.itemsList}>
              {items.map((item: any) => (
                <div key={item.id} className={styles.cartItem}>
                  <Typography variant="body" as="div">{item.name}</Typography>
                  <Typography variant="body" as="div">${item.price}</Typography>
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
                <Button variant="filled">Browse Events</Button>
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
          <div className={styles.summaryRow}>
            <Typography variant="body" as="div">Items</Typography>
            <Typography variant="body" as="div">{items?.length || 0}</Typography>
          </div>
          <div className={styles.summaryRow}>
            <Typography variant="h4" as="div">Total</Typography>
            <Typography variant="h4" as="div">${total || 0}</Typography>
          </div>
          <Link href="/checkout">
            <Button variant="filled" fullWidth disabled={!items || items.length === 0}>
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      }
      footer={<SiteFooter />}
      ratio="60-40"
      stickySide="right"
    />
  );
}
