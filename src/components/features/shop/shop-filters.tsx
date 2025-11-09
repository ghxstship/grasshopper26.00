/**
 * Shop Filters Component
 * Filter and search products
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SearchIcon } from '@/components/ui/icons/geometric-icons';

const CATEGORIES = [
  'Apparel',
  'Accessories',
  'Posters',
  'Vinyl',
  'Collectibles',
  'Event Exclusive',
];

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const currentCategory = searchParams.get('category');

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
    });
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (currentCategory === category) {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push('/shop');
    });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="SEARCH PRODUCTS..."
          className="w-full pl-12 pr-4 py-3 border-3 border-black font-bebas text-h6 uppercase placeholder:text-grey-400 focus:outline-none focus:bg-grey-100"
        />
      </div>

      {/* Category Filters */}
      <div>
        <p className="font-bebas text-h6 uppercase mb-3">FILTER BY CATEGORY:</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`
                px-4 py-2 border-3 border-black font-bebas text-body uppercase
                transition-colors
                ${currentCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-grey-100'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(search || currentCategory) && (
        <button
          onClick={clearFilters}
          className="font-bebas text-body uppercase underline hover:no-underline"
        >
          CLEAR ALL FILTERS
        </button>
      )}

      {/* Loading State */}
      {isPending && (
        <div className="text-center py-4">
          <p className="font-share text-body text-grey-600">
            Updating results...
          </p>
        </div>
      )}
    </div>
  );
}
