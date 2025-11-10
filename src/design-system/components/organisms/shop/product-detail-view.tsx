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
import styles from './product-detail-view.module.css';

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
      <section className={styles.breadcrumb}>
        <div className={styles.breadcrumbContainer}>
          <div className={styles.breadcrumbNav}>
            <Link href="/shop" className={styles.breadcrumbLink}>
              SHOP
            </Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className={styles.breadcrumbLink}>
              {product.category.toUpperCase()}
            </Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>{product.name.toUpperCase()}</span>
          </div>
        </div>
      </section>

      {/* Product Detail */}
      <section className={styles.section}>
        <div className={styles.container}>
          <Link
            href="/shop"
            className={styles.backLink}
          >
            <ArrowLeft className={styles.icon} />
            Back to Shop
          </Link>

          <div className={styles.productGrid}>
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className={styles.mainImage}>
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span className={styles.placeholderText}>
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className={styles.thumbnailGrid}>
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`${styles.thumbnail} ${
                        selectedImage === index ? styles.thumbnailActive : ''
                      }`}
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
              <p className={styles.category}>
                {product.category.toUpperCase()}
              </p>

              <h1 className={styles.productName}>
                {product.name}
              </h1>

              <p className={styles.price}>
                ${(currentPrice / 100).toFixed(2)}
              </p>

              {product.description && (
                <p className={styles.description}>
                  {product.description}
                </p>
              )}

              {/* Event Badge */}
              {product.events && (
                <Link
                  href={`/events/${product.events.slug}`}
                  className={styles.eventBadge}
                >
                  <Card className={styles.eventCard}>
                    <CardContent className={styles.eventCardContent}>
                      <p className={styles.eventLabel}>
                        EVENT EXCLUSIVE
                      </p>
                      <p className={styles.eventName}>
                        {product.events.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {/* Variant Selection */}
              {product.product_variants && product.product_variants.length > 0 && (
                <div className={styles.variantSection}>
                  <p className={styles.variantLabel}>
                    Select Variant
                  </p>
                  <div className={styles.variantGrid}>
                    {product.product_variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock_quantity === 0}
                        className={`${styles.variantButton} ${
                          selectedVariant?.id === variant.id
                            ? styles.variantButtonActive
                            : variant.stock_quantity === 0
                            ? styles.variantButtonDisabled
                            : ''
                        }`}
                      >
                        {variant.name}
                        {variant.stock_quantity === 0 && (
                          <span className={styles.soldOutText}>SOLD OUT</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {inStock && (
                <div className={styles.quantitySection}>
                  <p className={styles.variantLabel}>
                    Quantity
                  </p>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={styles.quantityButton}
                    >
                      -
                    </button>
                    <span className={styles.quantityDisplay}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                    <span className={styles.quantityAvailable}>
                      {maxQuantity} available
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || addedToCart}
                className={`${styles.addToCartButton} ${
                  inStock
                    ? addedToCart
                      ? styles.addToCartButtonAdded
                      : styles.addToCartButtonInStock
                    : styles.addToCartButtonOutOfStock
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className={styles.cartIcon} />
                    Added to Cart
                  </>
                ) : inStock ? (
                  <>
                    <ShoppingCart className={styles.cartIcon} />
                    Add to Cart
                  </>
                ) : (
                  'Out of Stock'
                )}
              </Button>

              {/* Product Features */}
              <div className={styles.features}>
                <div className={styles.featuresList}>
                  <div className={styles.feature}>
                    <Package className={styles.featureIcon} />
                    <div>
                      <p className={styles.featureTitle}>Premium Quality</p>
                      <p className={styles.featureDescription}>
                        Official GVTEWAY merchandise
                      </p>
                    </div>
                  </div>
                  <div className={styles.feature}>
                    <Truck className={styles.featureIcon} />
                    <div>
                      <p className={styles.featureTitle}>Free Shipping</p>
                      <p className={styles.featureDescription}>
                        On orders over $50
                      </p>
                    </div>
                  </div>
                  <div className={styles.feature}>
                    <Shield className={styles.featureIcon} />
                    <div>
                      <p className={styles.featureTitle}>Secure Checkout</p>
                      <p className={styles.featureDescription}>
                        Protected payment processing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.container}>
            <h2 className={styles.relatedTitle}>
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </>
  );
}
