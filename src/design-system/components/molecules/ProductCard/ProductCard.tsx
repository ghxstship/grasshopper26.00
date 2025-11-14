/**
 * ProductCard - Product display molecule
 * GHXSTSHIP Atomic Design System
 */

import Image from 'next/image';
import Link from 'next/link';
import { Card, Stack, Heading, Text, Button } from '../../atoms';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  /** Product name */
  name: string;
  /** Product price */
  price: string;
  /** Product image */
  image?: string;
  /** Product slug/link */
  slug: string;
  /** In stock */
  inStock?: boolean;
}

export function ProductCard({
  name,
  price,
  image,
  slug,
  inStock = true,
}: ProductCardProps) {
  return (
    <Card variant="elevated" padding={0} interactive>
      <Link href={`/shop/${slug}`} className={styles.link}>
        {/* Image */}
        {image && (
          <div className={styles.imageContainer}>
            <Image
              src={image}
              alt={name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!inStock && (
              <div className={styles.outOfStockBadge}>
                <Text font="bebas" size="lg" color="inverse" uppercase>
                  Out of Stock
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <Stack gap={3} className={styles.content}>
          <Heading level={4} font="bebas">
            {name}
          </Heading>

          <Text font="bebas" size="2xl" weight="bold">
            {price}
          </Text>

          <Button variant={inStock ? 'primary' : 'secondary'} fullWidth disabled={!inStock}>
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Stack>
      </Link>
    </Card>
  );
}
