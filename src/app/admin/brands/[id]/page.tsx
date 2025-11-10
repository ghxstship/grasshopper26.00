'use client';

import { AdminDetailTemplate } from '@/design-system/components/templates';
import { Building, DollarSign, Calendar, Globe } from 'lucide-react';
import { useAdminBrandDetail } from '@/hooks/useAdminBrandDetail';
import { useParams } from 'next/navigation';

export default function AdminBrandDetailPage() {
  const params = useParams();
  const { brand, loading } = useAdminBrandDetail(params.id as string);

  return (
    <AdminDetailTemplate
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Brands', href: '/admin/brands' },
        { label: brand?.name || 'Brand', href: `/admin/brands/${params.id}` },
      ]}
      title={brand?.name || 'Brand Details'}
      statusBadge={{ label: brand?.status || 'active', variant: 'success' }}
      loading={loading}
      tabs={[
        { key: 'overview', label: 'Overview', content: <div>Brand overview</div> },
        { key: 'sponsorships', label: 'Sponsorships', content: <div>Sponsorship details</div> },
        { key: 'analytics', label: 'Analytics', content: <div>Performance metrics</div> },
      ]}
      metadata={[
        { label: 'Company', value: brand?.name },
        { label: 'Total Value', value: `$${brand?.total_value?.toLocaleString()}` },
        { label: 'Partner Since', value: brand?.created_at },
        { label: 'Website', value: brand?.website },
      ]}
      primaryAction={{ label: 'Edit Brand', href: `/admin/brands/${params.id}/edit` }}
      secondaryActions={[
        { label: 'View Contract', onClick: () => {} },
        { label: 'Send Report', onClick: () => {} },
      ]}
    />
  );
}
