'use client';

import { AdminListTemplate } from '@/design-system';
import { Package, Plus } from 'lucide-react';
import { useAdminInventory } from '@/hooks/useAdminInventory';
import { InventoryTable } from '@/design-system';

export default function AdminInventoryPage() {
  const { inventory, stats, loading, searchQuery, setSearchQuery } = useAdminInventory();

  return (
    <AdminListTemplate
      title="Inventory Management"
      subtitle="Manage product inventory and stock levels"
      loading={loading}
      stats={[
        { label: 'Total Products', value: stats.total },
        { label: 'In Stock', value: stats.in_stock },
        { label: 'Low Stock', value: stats.low_stock },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search inventory..."
      primaryAction={{ label: 'Add Product', icon: <Plus />, href: '/admin/inventory/create' }}
      empty={{
        icon: <Package />,
        title: 'No inventory',
        description: 'Add products to start managing inventory',
      }}
    >
      <InventoryTable items={inventory} />
    </AdminListTemplate>
  );
}
