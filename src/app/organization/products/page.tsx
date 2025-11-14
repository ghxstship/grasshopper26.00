'use client';

import { Heading, Text } from '@/design-system';
import { AdminListTemplate } from '@/design-system';
import { Package, Plus } from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import styles from './products.module.css';

export default function AdminProductsPage() {
  const { products, stats, loading, searchQuery, setSearchQuery } = useAdminProducts();

  return (
    <AdminListTemplate
      title="Products Management"
      description="Manage shop products and merchandise"
      stats={[
        { label: 'Total Products', value: stats.total, icon: <Package /> },
        { label: 'In Stock', value: stats.in_stock, icon: <Package /> },
        { label: 'Out of Stock', value: stats.out_of_stock, icon: <Package /> },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search products..."
      primaryAction={{
        label: 'Add Product',
        icon: <Plus className={styles.icon} />,
        href: '/admin/products/new',
      }}
      loading={loading}
      empty={{
        icon: <Package />,
        title: 'No products',
        description: 'Add your first product',
        action: {
          label: 'Add Product',
          href: '/admin/products/new',
        },
      }}
    >
      {products && products.length > 0 && (
        <div className={styles.productsTable}>
          {products.map((product: any) => (
            <div key={product.id} className={styles.productRow}>
              <Text>{product.name}</Text>
              <Text>${product.price}</Text>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
