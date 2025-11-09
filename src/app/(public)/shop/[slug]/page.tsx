/**
 * Product Detail Page
 * Displays individual product information with variants and purchase options
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductDetailView } from '@/components/features/shop/product-detail-view';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('name, description, images')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!product) {
    return {
      title: 'Product Not Found | GVTEWAY',
    };
  }

  return {
    title: `${product.name} | GVTEWAY Shop`,
    description: product.description || `Shop ${product.name} at GVTEWAY`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch product with variants
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*),
      events (
        name,
        slug,
        start_date
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch related products from same category
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, name, slug, base_price, images, category')
    .eq('category', product.category)
    .eq('status', 'active')
    .neq('id', product.id)
    .limit(4);

  return (
    <main className="min-h-screen bg-white">
      <ProductDetailView 
        product={product} 
        relatedProducts={relatedProducts || []} 
      />
    </main>
  );
}
