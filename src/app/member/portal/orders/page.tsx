'use client';

import { PortalLayout } from '@/design-system/components/templates/PortalLayout/PortalLayout';
import { PortalSidebar } from '@/design-system/components/organisms/PortalSidebar/PortalSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
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
            <Typography variant="body" as="p">Loading orders...</Typography>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className={styles.ordersGrid}>
            {orders.map((order: any) => (
              <div key={order.id} className={styles.orderCard}>
                <Typography variant="h4" as="div">Order #{order.id}</Typography>
                <Typography variant="body" as="div">{order.status}</Typography>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <ShoppingBag className={styles.emptyIcon} />
            <Typography variant="h3" as="p">No Orders Yet</Typography>
            <Typography variant="body" as="p">
              You haven&apos;t placed any orders yet. Start exploring!
            </Typography>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
