'use client';

import { PortalLayout } from '@/design-system';
import { PortalSidebar } from '@/design-system';
import { Heading, Text } from '@/design-system';
import { ShoppingBag } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import styles from './orders.module.css';

export default function OrderHistoryPage() {
  const { orders, loading } = useOrders();

  return (
    <PortalLayout
      sidebar={<PortalSidebar />}
      title="Order History"
      description="View all your past and current orders"
    >
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <Text>Loading orders...</Text>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className={styles.ordersGrid}>
            {orders.map((order: any) => (
              <div key={order.id} className={styles.orderCard}>
                <Heading level={4} font="bebas">Order #{order.id}</Heading>
                <Text color="secondary">{order.status}</Text>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <ShoppingBag className={styles.emptyIcon} />
            <Heading level={3} font="bebas">No Orders Yet</Heading>
            <Text color="secondary">
              You haven&apos;t placed any orders yet. Start exploring!
            </Text>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
