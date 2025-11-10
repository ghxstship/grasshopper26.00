/**
 * Product Card - Design System Compliant
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './product-card.module.css';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    image_url?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <div className={styles.price}>${parseFloat(product.price).toFixed(2)}</div>
      </div>
    </Link>
  );
}
