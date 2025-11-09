/**
 * Shop Page
 * Browse merchandise and products
 */

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductGrid } from '@/components/features/shop/product-grid';
import { ShopFilters } from '@/components/features/shop/shop-filters';

export const metadata: Metadata = {
  title: 'Shop | GVTEWAY',
  description: 'Official GVTEWAY merchandise and event products',
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    event?: string;
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const supabase = await createClient();
  const { category, event, search } = await searchParams;

  // Build query
  let query = supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Apply filters
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (event) {
    query = query.eq('event_id', event);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Failed to fetch products:', error);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b-3 border-black py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-hero uppercase mb-4">
            SHOP
          </h1>
          <p className="font-share text-body max-w-2xl">
            Official GVTEWAY merchandise. Limited edition items, event exclusives, 
            and more. All designs feature our signature monochromatic aesthetic.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b-3 border-black py-8">
        <div className="container mx-auto px-4">
          <ShopFilters />
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {products && products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-20">
              <p className="font-bebas text-h3 uppercase mb-4">
                NO PRODUCTS FOUND
              </p>
              <p className="font-share text-body text-grey-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
