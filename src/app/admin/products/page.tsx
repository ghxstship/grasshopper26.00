'use client';

import { AdminListTemplate } from '@/design-system/components/templates';
import { Package, Plus } from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { ProductsTable } from '@/design-system/components/organisms/admin/products-table';

export default function AdminProductsPage() {
  const { products, stats, loading, searchQuery, setSearchQuery } = useAdminProducts();

  return (
    <AdminListTemplate
      title="Products Management"
      subtitle="Manage shop products and merchandise"
      loading={loading}
      stats={[
        { label: 'Total Products', value: stats.total },
        { label: 'In Stock', value: stats.in_stock },
        { label: 'Out of Stock', value: stats.out_of_stock },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search products..."
      primaryAction={{ label: 'Add Product', icon: <Plus />, href: '/admin/products/new' }}
      empty={{
        icon: <Package />,
        title: 'No products',
        description: 'Add your first product',
      }}
    >
      <ProductsTable products={products} />
    </AdminListTemplate>
  );
}
