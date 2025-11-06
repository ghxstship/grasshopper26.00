import { createClient as createServerClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default async function ShopPage() {
  const supabase = await createServerClient();

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Official Merchandise
          </h1>
          <p className="text-gray-400 text-lg">
            Exclusive apparel, accessories, and collectibles
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => {
              const minPrice = product.product_variants?.reduce(
                (min: number, variant: any) => 
                  variant.price < min ? variant.price : min,
                product.base_price
              ) || product.base_price;

              return (
                <Link key={product.id} href={`/shop/${product.slug}`}>
                  <Card className="group bg-black/40 backdrop-blur-lg border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600" />
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                        <span className="text-white font-bold">${minPrice}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
              <p className="text-gray-400">
                Our merchandise store is being stocked. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
