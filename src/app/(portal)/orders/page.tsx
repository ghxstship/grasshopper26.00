'use client';

import { OrderHistoryTemplate } from '@/design-system/components/templates';
import { Package } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/design-system/components/organisms/orders/order-card';

export default function OrderHistoryPage() {
  const { orders, loading } = useOrders();

  return (
    <OrderHistoryTemplate
      title="Order History"
      subtitle="View all your past and current orders"
      orders={orders}
      renderOrder={(order) => <OrderCard order={order} />}
      emptyState={{
        icon: <Package />,
        title: "No Orders Yet",
        description: "You haven't placed any orders yet. Start exploring!",
        action: {
          label: "Browse Events",
          href: "/events",
        },
      }}
      loading={loading}
      loadingCount={3}
    />
  );
}
