'use client';

import { PortalDashboardTemplate } from '@/design-system/components/templates';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { CartItemsList } from '@/design-system/components/organisms/cart/cart-items-list';

export default function CartPage() {
  const { items, total, loading } = useCart();

  return (
    <PortalDashboardTemplate
      greeting="Shopping Cart"
      userInfo={<span>{items.length} items in cart</span>}
      statsCards={[
        { label: 'Items', value: items.length, icon: <ShoppingCart /> },
        { label: 'Total', value: `$${total}`, icon: <ShoppingCart /> },
      ]}
      sections={[
        {
          id: 'cart',
          title: 'Your Cart',
          content: <CartItemsList items={items} />,
          isEmpty: items.length === 0,
          emptyState: {
            icon: <ShoppingCart />,
            title: 'Your cart is empty',
            description: 'Browse events and shop to add items',
            action: { label: 'Browse Events', onClick: () => window.location.href = '/events' },
          },
        },
      ]}
      layout="single-column"
      loading={loading}
    />
  );
}
