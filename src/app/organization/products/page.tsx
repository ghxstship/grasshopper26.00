'use client';

import { AdminListTemplate } from '@/design-system/components/templates/AdminListTemplate/AdminListTemplate';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Package, Plus } from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import styles from './products.module.css';

export default function AdminProductsPage() {
  const { products, stats, loading, searchQuery, setSearchQuery } = useAdminProducts();

  return (
    <AdminListTemplate
      sidebar={<AdminSidebar />}
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
        icon: <Plus style={{ width: 20, height: 20 }} />,
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
              <Typography variant="body" as="div">{product.name}</Typography>
              <Typography variant="body" as="div">${product.price}</Typography>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
