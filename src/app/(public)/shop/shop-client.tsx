/**
 * Shop Browse Client Component
 * Uses PublicBrowseTemplate
 */

'use client';

import { useState } from 'react';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Package } from 'lucide-react';
import styles from './shop-client.module.css';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  image_url?: string;
  category: string;
}

interface ShopBrowseClientProps {
  initialProducts: Product[];
  initialSearch?: string;
}

export function ShopBrowseClient({ initialProducts, initialSearch }: ShopBrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('created-desc');

  // Filter and sort products
  const filteredProducts = initialProducts
    .filter(product =>
      searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        default:
          return 0;
      }
    });

  return (
    <GridLayout
      title="Shop Brands"
      description="Official GVTEWAY merchandise. Limited edition items, event exclusives, and more."
      search={
        <Input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      }
      columns={4}
    >
      {filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
          <div key={product.id} className={styles.productCard}>
            <Typography variant="h4" as="div">{product.name}</Typography>
            <Typography variant="body" as="div">${product.price}</Typography>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>
          <Package className={styles.emptyIcon} />
          <Typography variant="h3" as="p">No products found</Typography>
          <Typography variant="body" as="p">Try adjusting your search</Typography>
        </div>
      )}
    </GridLayout>
  );
}
