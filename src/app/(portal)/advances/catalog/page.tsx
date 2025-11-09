'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GeometricIcon, IconName } from '@/design-system/components/atoms/GeometricIcon';
import { CatalogItemCard } from '@/design-system/components/molecules/CatalogItemCard';
import { CartSidebar } from '@/components/features/production-advances/CartSidebar';
import { useAdvanceCart } from '@/contexts/AdvanceCartContext';
import { CatalogCategory, CatalogItem } from '@/lib/types/production-advances';
import { cn } from '@/lib/utils';
import { Search, ShoppingCart } from 'lucide-react';

const categoryIcons: Record<string, IconName> = {
  access: 'badge',
  production: 'mixer',
  technical: 'speaker',
  hospitality: 'plate',
  travel: 'plane',
  custom: 'star',
};

function CatalogBrowsePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems, itemCount, isCartOpen, openCart, closeCart, removeItem } = useAdvanceCart();

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/catalog/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch catalog items
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`/api/catalog?${params.toString()}`);
        const data = await response.json();
        setCatalogItems(data.items || []);
      } catch (error) {
        console.error('Error fetching catalog items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug);
    if (slug) {
      router.push(`/advances/catalog?category=${slug}`);
    } else {
      router.push('/advances/catalog');
    }
  };

  const handleItemClick = (item: CatalogItem) => {
    router.push(`/advances/catalog/${item.id}`);
  };

  const handleEditCartItem = (itemId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit item:', itemId);
  };

  const handleProceedToCheckout = () => {
    router.push('/advances/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-3 border-black bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-anton text-4xl uppercase">PRODUCTION CATALOG</h1>
              <p className="mt-2 font-share-tech text-grey-700">
                Browse equipment, services, and resources for your event
              </p>
            </div>

            {/* Floating Cart Button (Desktop) */}
            <button
              type="button"
              onClick={openCart}
              className="hidden items-center gap-3 border-3 border-black bg-black px-6 py-4 font-bebas-neue text-lg uppercase text-white transition-colors hover:bg-white hover:text-black md:flex"
            >
              <ShoppingCart className="h-5 w-5" />
              ADVANCE CART ({itemCount})
              <GeometricIcon name="arrow-right" size="md" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b-3 border-black bg-grey-50">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4">
            <button
              type="button"
              onClick={() => handleCategoryChange(null)}
              className={cn(
                'flex shrink-0 items-center gap-2 border-3 px-4 py-2',
                'font-bebas-neue text-sm uppercase transition-colors',
                !selectedCategory
                  ? 'border-black bg-black text-white'
                  : 'border-black bg-white text-black hover:bg-grey-100'
              )}
            >
              ALL
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.slug)}
                className={cn(
                  'flex shrink-0 items-center gap-2 border-3 px-4 py-2',
                  'font-bebas-neue text-sm uppercase transition-colors',
                  selectedCategory === category.slug
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black hover:bg-grey-100'
                )}
              >
                <GeometricIcon name={categoryIcons[category.slug] || 'star'} size="sm" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b-2 border-grey-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-400" />
            <input
              type="text"
              placeholder="Search equipment, passes, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-3 border-black bg-white py-3 pl-12 pr-4 font-share-tech outline-none focus:border-grey-800"
            />
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent" />
          </div>
        ) : catalogItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <GeometricIcon name="search" size="xl" className="mb-4 text-grey-400" />
            <p className="font-share-tech text-grey-700">No items found</p>
            <p className="mt-2 font-share-tech-mono text-sm text-grey-600">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalogItems.map((item) => (
              <CatalogItemCard
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Cart Button (Fixed) */}
      <button
        type="button"
        onClick={openCart}
        className="fixed bottom-8 right-8 z-30 flex items-center gap-3 border-3 border-black bg-black px-6 py-4 font-bebas-neue text-lg uppercase text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-white hover:text-black md:hidden"
      >
        <ShoppingCart className="h-5 w-5" />
        CART ({itemCount})
      </button>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        items={cartItems}
        onClose={closeCart}
        onEditItem={handleEditCartItem}
        onRemoveItem={removeItem}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
}

export default function CatalogBrowsePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    }>
      <CatalogBrowsePageContent />
    </Suspense>
  );
}
