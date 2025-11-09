/**
 * Product Detail View Component
 * Displays product information, images, variants, and purchase options
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { ShoppingCart, ArrowLeft, Check, Package, Truck, Shield } from 'lucide-react';
import { ProductGrid } from './product-grid';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  variant_attributes?: Record<string, any>;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  base_price: number;
  images?: string[];
  product_variants?: ProductVariant[];
  events?: {
    name: string;
    slug: string;
    start_date: string;
  };
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  images?: string[];
  category: string;
}

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: RelatedProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.product_variants?.[0] || null
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const currentPrice = selectedVariant?.price || product.base_price;
  const inStock = selectedVariant ? selectedVariant.stock_quantity > 0 : true;
  const maxQuantity = selectedVariant?.stock_quantity || 99;

  const handleAddToCart = async () => {
    // TODO: Implement cart functionality
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
      {/* Breadcrumb */}
      <section className="border-b-3 border-black py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 font-share-mono text-meta">
            <Link href="/shop" className="hover:underline">
              SHOP
            </Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:underline">
              {product.category.toUpperCase()}
            </Link>
            <span>/</span>
            <span className="text-grey-600">{product.name.toUpperCase()}</span>
          </div>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-bebas text-body uppercase mb-8 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="aspect-square border-3 border-black bg-grey-100 mb-4 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-anton text-display uppercase text-grey-400">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square border-3 ${
                        selectedImage === index ? 'border-black' : 'border-grey-300'
                      } relative overflow-hidden hover:border-black transition-colors`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="font-share-mono text-meta mb-2 text-grey-600">
                {product.category.toUpperCase()}
              </p>

              <h1 className="font-anton text-hero uppercase mb-4">
                {product.name}
              </h1>

              <p className="font-bebas text-h2 uppercase mb-6">
                ${(currentPrice / 100).toFixed(2)}
              </p>

              {product.description && (
                <p className="font-share text-body text-grey-700 mb-8 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Event Badge */}
              {product.events && (
                <Link
                  href={`/events/${product.events.slug}`}
                  className="inline-block mb-6"
                >
                  <Card className="border-2 border-black hover:bg-black hover:text-white transition-colors">
                    <CardContent className="p-4">
                      <p className="font-share-mono text-meta mb-1">
                        EVENT EXCLUSIVE
                      </p>
                      <p className="font-bebas text-body uppercase">
                        {product.events.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {/* Variant Selection */}
              {product.product_variants && product.product_variants.length > 0 && (
                <div className="mb-6">
                  <p className="font-bebas text-body uppercase mb-3 block">
                    Select Variant
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {product.product_variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock_quantity === 0}
                        className={`border-3 p-4 font-bebas text-body uppercase transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-black bg-black text-white'
                            : variant.stock_quantity === 0
                            ? 'border-grey-300 text-grey-400 cursor-not-allowed'
                            : 'border-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {variant.name}
                        {variant.stock_quantity === 0 && (
                          <span className="block text-meta mt-1">SOLD OUT</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {inStock && (
                <div className="mb-6">
                  <p className="font-bebas text-body uppercase mb-3 block">
                    Quantity
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 border-3 border-black font-bebas text-h4 hover:bg-black hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="font-bebas text-h4 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      className="w-12 h-12 border-3 border-black font-bebas text-h4 hover:bg-black hover:text-white transition-colors"
                    >
                      +
                    </button>
                    <span className="font-share text-meta text-grey-600">
                      {maxQuantity} available
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || addedToCart}
                className={`w-full h-14 border-3 border-black font-bebas text-h4 uppercase mb-6 ${
                  inStock
                    ? addedToCart
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-black text-white hover:bg-white hover:text-black'
                    : 'bg-grey-300 text-grey-600 cursor-not-allowed'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Added to Cart
                  </>
                ) : inStock ? (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                ) : (
                  'Out of Stock'
                )}
              </Button>

              {/* Product Features */}
              <div className="border-t-3 border-black pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Package className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-bebas text-body uppercase">Premium Quality</p>
                    <p className="font-share text-meta text-grey-600">
                      Official GVTEWAY merchandise
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Truck className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-bebas text-body uppercase">Free Shipping</p>
                    <p className="font-share text-meta text-grey-600">
                      On orders over $50
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-bebas text-body uppercase">Secure Checkout</p>
                    <p className="font-share text-meta text-grey-600">
                      Protected payment processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t-3 border-black py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-anton text-h1 uppercase mb-8">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </>
  );
}
