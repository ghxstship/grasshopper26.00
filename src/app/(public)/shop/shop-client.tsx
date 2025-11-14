/**
 * Shop Client - Shop page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Heading } from '@/design-system';
import { ProductsGrid } from '@/design-system';
import { PageTemplate } from '@/design-system';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string;
  in_stock?: boolean;
}

interface ShopClientProps {
  products: Product[];
}

export function ShopClient({ products }: ShopClientProps) {
  const navItems = [
    { label: 'Events', href: '/events' },
    { label: 'Music', href: '/music' },
    { label: 'Shop', href: '/shop' },
    { label: 'Membership', href: '/membership' },
  ];

  const formatProductCard = (product: Product) => ({
    name: product.name,
    slug: product.slug,
    price: `$${product.price.toFixed(2)}`,
    image: product.image_url,
    inStock: product.in_stock !== false,
  });

  return (
    <PageTemplate
      headerProps={{
        logoText: 'GVTEWAY',
        navItems,
        showAuth: true,
      }}
    >
      <Stack gap={8}>
        <Heading level={1} font="anton">
          Shop
        </Heading>

        <ProductsGrid
          products={products.map(formatProductCard)}
          columns={4}
        />
      </Stack>
    </PageTemplate>
  );
}
