/**
 * Shop Browse Client Component
 * Uses PublicBrowseTemplate
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { ProductCard } from '@/design-system/components/molecules/ProductCard/ProductCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
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
  category?: string;
  brand?: string;
  in_stock?: boolean;
}

interface ShopBrowseClientProps {
  initialProducts: Product[];
  initialSearch?: string;
}

export function ShopBrowseClient({ initialProducts, initialSearch }: ShopBrowseClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('name-asc');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort products
  let filteredProducts = initialProducts.filter(product => {
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesSearch;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <GridLayout
      title="Shops"
      description="Discover brands and merchandise"
      search={
        <SearchBar
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
        />
      }
      filters={
        <Select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          options={[
            { value: 'name-asc', label: 'Name (A-Z)' },
            { value: 'name-desc', label: 'Name (Z-A)' },
            { value: 'price-asc', label: 'Price (Low to High)' },
            { value: 'price-desc', label: 'Price (High to Low)' },
          ]}
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
      {loading ? (
        Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
          <Skeleton key={i} height="400px" />
        ))
      ) : paginatedProducts.length > 0 ? (
        paginatedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.image_url,
              category: product.category,
              brand: product.brand,
              inStock: product.in_stock !== false,
            }}
            onClick={() => router.push(`/shop/${product.slug}`)}
          />
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
