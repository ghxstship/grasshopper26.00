/**
 * Product Grid Component
 * Displays products in a responsive grid
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './product-grid.module.css';

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
    <div className={styles.grid}>
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
            <article className={styles.card}>
              {/* Product Image */}
              <div className={styles.card}>
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={styles.row}>
                    <span className={styles.text}>
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Out of Stock Badge */}
                {!inStock && (
                  <div className={styles.card}>
                    <span className={styles.container}>
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className={styles.card}>
                <p className={styles.text}>
                  {product.category.toUpperCase()}
                </p>

                <h3 className={styles.container}>
                  {product.name}
                </h3>

                {product.description && (
                  <p className={styles.text}>
                    {product.description}
                  </p>
                )}

                <p className={styles.container}>
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
