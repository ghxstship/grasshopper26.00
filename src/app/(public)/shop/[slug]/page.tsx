import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './product-detail-client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('name, description').eq('slug', slug).single();
  
  return {
    title: product ? `${product.name} | GVTEWAY Shop` : 'Product | GVTEWAY',
    description: product?.description || 'Product details',
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: product } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
