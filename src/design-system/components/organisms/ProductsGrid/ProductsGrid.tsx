/**
 * ProductsGrid - Products grid organism
 * GHXSTSHIP Atomic Design System
 */

import { Grid, Stack, Heading } from '../../atoms';
import { ProductCard, ProductCardProps } from '../../molecules';

export interface ProductsGridProps {
  /** Section title */
  title?: string;
  /** Products to display */
  products: ProductCardProps[];
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
}

export function ProductsGrid({
  title,
  products,
  columns = 4,
}: ProductsGridProps) {
  return (
    <Stack gap={8}>
      {title && (
        <Heading level={2} font="bebas">
          {title}
        </Heading>
      )}

      <Grid columns={columns} gap={6} responsive>
        {products.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </Grid>
    </Stack>
  );
}
