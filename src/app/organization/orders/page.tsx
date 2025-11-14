'use client';

import { AdminListTemplate } from '@/design-system';
import { Receipt } from 'lucide-react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { OrdersTable } from '@/design-system';

export default function AdminOrdersPage() {
  const { orders, stats, loading, searchQuery, setSearchQuery } = useAdminOrders();

  return (
    <AdminListTemplate
      title="Orders Management"
      subtitle="View and manage all orders"
      loading={loading}
      stats={[
        { label: 'Total Orders', value: stats.total },
        { label: 'Pending', value: stats.pending },
        { label: 'Completed', value: stats.completed },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search orders..."
      empty={{
        icon: <Receipt />,
        title: 'No orders',
        description: 'Orders will appear here',
      }}
    >
      <OrdersTable orders={orders} />
    </AdminListTemplate>
  );
}
