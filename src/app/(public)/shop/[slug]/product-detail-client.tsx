'use client';

import { DetailViewTemplate } from '@/design-system/components/templates';
import { DollarSign, Package } from 'lucide-react';

export function ProductDetailClient({ product }: { product: any }) {
  return (
    <DetailViewTemplate
      breadcrumbs={[
        { label: 'Shop', href: '/shop' },
        { label: product.name, href: `/shop/${product.slug}` },
      ]}
      heroImage={product.image_url}
      title={product.name}
      subtitle={product.category}
      primaryAction={{ label: 'Add to Cart', onClick: () => {} }}
      sidebar={
        <div>
          <h3>Product Details</h3>
          <div><DollarSign /> ${parseFloat(product.price).toFixed(2)}</div>
          <div><Package /> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</div>
        </div>
      }
    >
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
    </DetailViewTemplate>
  );
}
