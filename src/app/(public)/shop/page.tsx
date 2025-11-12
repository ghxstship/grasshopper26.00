/**
 * Shop Page
 * Browse merchandise and products
 */

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ShopBrowseClient } from './shop-client';

export const metadata: Metadata = {
  title: 'Shops | GVTEWAY',
  description: 'Discover brands and merchandise',
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

  return <ShopBrowseClient initialProducts={products || []} initialSearch={search} />;
}
