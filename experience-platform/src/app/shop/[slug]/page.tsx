import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, Ruler } from 'lucide-react';
import { AddToCartButton } from '@/components/features/add-to-cart-button';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*)
    `)
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single();

  if (error || !product) {
    return notFound();
  }

  const hasVariants = product.product_variants && product.product_variants.length > 0;
  const inStock = hasVariants 
    ? product.product_variants.some((v: any) => v.stock_quantity > 0)
    : true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-black/40 border border-purple-500/20">
              {product.images && product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden bg-black/40 border border-purple-500/20 cursor-pointer hover:border-purple-500/50 transition-all"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 2}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {product.category}
                  </Badge>
                )}
                {!inStock && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-white">
                ${product.base_price.toFixed(2)}
              </p>
            </div>

            {product.description && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Description</h2>
                <p className="text-gray-300 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {hasVariants && (
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Select Options</h3>
                  <div className="space-y-4">
                    {product.product_variants.map((variant: any) => (
                      <div
                        key={variant.id}
                        className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-white">{variant.name}</p>
                            {variant.variant_attributes && (
                              <p className="text-sm text-gray-400">
                                {Object.entries(variant.variant_attributes)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-400">
                              ${variant.price?.toFixed(2) || product.base_price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400">
                              {variant.stock_quantity > 0 
                                ? `${variant.stock_quantity} in stock`
                                : 'Out of stock'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                disabled={!inStock}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 border-purple-500/30"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 border-purple-500/30"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Size Guide
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Check our size chart before ordering</p>
                  <p>• All measurements are in inches</p>
                  <p>• For best fit, measure yourself and compare</p>
                  <Button variant="link" className="text-purple-400 p-0 h-auto">
                    View Full Size Chart →
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Product Details</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SKU:</span>
                    <span>{product.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span>{product.category || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Availability:</span>
                    <span className={inStock ? 'text-green-400' : 'text-red-400'}>
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
