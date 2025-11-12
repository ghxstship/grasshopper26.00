/**
 * ProductCard Component
 * GHXSTSHIP Entertainment Platform - Product/Merchandise Card
 * B&W imagery, BEBAS NEUE headlines, SHARE TECH body copy
 */

import * as React from 'react';
import Image from 'next/image';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: string | number;
    imageUrl?: string;
    category?: string;
    inStock?: boolean;
    brand?: string;
  };
  onClick?: () => void;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onClick, variant = 'vertical', className = '' }, ref) => {
    const classNames = [
      styles.card,
      styles[variant],
      onClick && styles.clickable,
      !product.inStock && styles.outOfStock,
      className,
    ].filter(Boolean).join(' ');

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    };

    const formatPrice = (price: string | number): string => {
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      return `$${numPrice.toFixed(2)}`;
    };

    return (
      <article
        ref={ref}
        className={classNames}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `View product: ${product.name}` : undefined}
      >
        {product.imageUrl && (
          <div className={styles.imageContainer}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className={styles.halftoneOverlay} aria-hidden="true" />
            {!product.inStock && (
              <div className={styles.stockBadge}>
                <span>OUT OF STOCK</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.meta}>
            {product.category && (
              <span className={styles.category}>{product.category}</span>
            )}
            {product.brand && (
              <span className={styles.brand}>{product.brand}</span>
            )}
          </div>

          <h3 className={styles.title}>{product.name}</h3>

          <div className={styles.priceContainer}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {!product.inStock && (
              <span className={styles.stockStatus}>UNAVAILABLE</span>
            )}
          </div>
        </div>
      </article>
    );
  }
);

ProductCard.displayName = 'ProductCard';
