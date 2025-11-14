/**
 * Product Detail Client
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Heading, Text, Button, Card } from '@/design-system';
import { PageTemplate } from '@/design-system';

interface ProductDetailClientProps {
  product: any;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const navItems = [
    { label: 'Events', href: '/events' },
    { label: 'Music', href: '/music' },
    { label: 'Shop', href: '/shop' },
    { label: 'Membership', href: '/membership' },
  ];

  return (
    <PageTemplate
      headerProps={{
        logoText: 'GVTEWAY',
        navItems,
        showAuth: true,
      }}
    >
      <Stack gap={8}>
        <Stack gap={4}>
          <Heading level={1} font="anton">
            {product.name}
          </Heading>
          {product.description && (
            <Text size="lg" color="secondary">
              {product.description}
            </Text>
          )}
        </Stack>

        <Card variant="outlined" padding={6}>
          <Stack gap={4}>
            <Text size="2xl" weight="bold">
              ${(product.price / 100).toFixed(2)}
            </Text>
            <Button variant="primary" size="lg" fullWidth>
              Add to Cart
            </Button>
          </Stack>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
