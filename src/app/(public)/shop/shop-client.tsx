/**
 * Shop Browse Client Component
 * Uses PublicBrowseTemplate
 */

'use client';

import { useState } from 'react';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Pagination } from '@/design-system/components/molecules/Pagination/Pagination';
import { Package } from 'lucide-react';
import styles from './shop-client.module.css';

const ITEMS_PER_PAGE = 12;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <GridLayout
      title="Shops"
      description="Discover brands and merchandise"
      search={
        <Input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      }
      columns={4}
      pagination={
        totalPages > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        ) : undefined
      }
    >
      {paginatedProducts.length > 0 ? (
        paginatedProducts.map(product => (
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
