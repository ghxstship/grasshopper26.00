/**
 * Product Grid Component
 * Displays products in a responsive grid
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ProductVariant {
  id: string;
  price: number;
  stock_quantity: number;
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
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const minPrice = product.product_variants && product.product_variants.length > 0
          ? Math.min(...product.product_variants.map(v => v.price))
          : product.base_price;

        const inStock = product.product_variants && product.product_variants.length > 0
          ? product.product_variants.some(v => v.stock_quantity > 0)
          : true;

        return (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className="group"
          >
            <article className="border-3 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-geometric">
              {/* Product Image */}
              <div className="aspect-square relative overflow-hidden border-b-3 border-black">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-grey-200 flex items-center justify-center">
                    <span className="font-anton text-h1 uppercase text-grey-400">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Out of Stock Badge */}
                {!inStock && (
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 border-2 border-white">
                    <span className="font-bebas text-body uppercase">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="font-share-mono text-meta mb-2 text-grey-600 group-hover:text-grey-400">
                  {product.category.toUpperCase()}
                </p>

                <h3 className="font-bebas text-h4 uppercase mb-2 group-hover:text-white">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="font-share text-body line-clamp-2 text-grey-700 group-hover:text-grey-300 mb-3">
                    {product.description}
                  </p>
                )}

                <p className="font-bebas text-h5 uppercase">
                  ${(minPrice / 100).toFixed(2)}
                  {product.product_variants && product.product_variants.length > 1 && '+'}
                </p>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
