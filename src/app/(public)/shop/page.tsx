import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ShopClient } from './shop-client';

export const metadata: Metadata = {
  title: 'Shop - GVTEWAY',
  description: 'Browse merchandise and products',
};

export default async function ShopPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return <ShopClient products={products || []} />;
}
