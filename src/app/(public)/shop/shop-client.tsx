/**
 * Shop Browse Client Component
 * Uses PublicBrowseTemplate
 */

'use client';

import { useState } from 'react';
import { PublicBrowseTemplate } from '@/design-system/components/templates';
import { Package } from 'lucide-react';
import { ProductCard } from '@/design-system/components/organisms/shop/product-card';

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
    <PublicBrowseTemplate
      title="SHOP"
      subtitle="Official GVTEWAY merchandise. Limited edition items, event exclusives, and more."
      heroGradient={true}
      searchPlaceholder="Search products..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showSearch={true}
      sortOptions={[
        { value: 'created-desc', label: 'Newest First' },
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'price-asc', label: 'Price (Low to High)' },
        { value: 'price-desc', label: 'Price (High to Low)' },
      ]}
      sortValue={sortBy}
      onSortChange={setSortBy}
      items={filteredProducts}
      renderItem={(product) => <ProductCard product={product} />}
      gridColumns={4}
      gap="lg"
      showResultsCount={true}
      totalCount={initialProducts.length}
      emptyState={{
        icon: <Package />,
        title: "No products found",
        description: "Try adjusting your search",
        action: {
          label: "Clear Search",
          onClick: () => setSearchQuery(''),
        },
      }}
    />
  );
}
