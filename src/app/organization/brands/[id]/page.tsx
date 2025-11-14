'use client';

import { AdminDetailTemplate } from '@/design-system';
import { Building, DollarSign, Calendar, Globe } from 'lucide-react';
import { useAdminBrandDetail } from '@/hooks/useAdminBrandDetail';
import { useParams, useRouter } from 'next/navigation';

export default function AdminBrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { brand, loading } = useAdminBrandDetail(params.id as string);

  return (
    <AdminDetailTemplate
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Brands', href: '/admin/brands' },
        { label: brand?.name || 'Brand', href: `/admin/brands/${params.id}` },
      ]}
      title={brand?.name || 'Brand Details'}
      statusBadge={<span>{brand?.status || 'active'}</span>}
      loading={loading}
      tabs={[
        { key: 'overview', label: 'Overview', content: <div>Brand overview</div> },
        { key: 'sponsorships', label: 'Sponsorships', content: <div>Sponsorship details</div> },
        { key: 'analytics', label: 'Analytics', content: <div>Performance metrics</div> },
      ]}
      metadata={
        <div>
          <div>Founded: {brand?.founded_year}</div>
          <div>Website: {brand?.website_url}</div>
          <div>Contact: {brand?.contact_email}</div>
          <div>Products: {brand?.product_count || 0}</div>
        </div>
      }
      primaryAction={{ label: 'Edit Brand', onClick: () => {} }}
      secondaryActions={[{ label: 'View Contract', onClick: () => {} }]}
    >
      <div>Brand details content</div>
    </AdminDetailTemplate>
  );
}
