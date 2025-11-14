'use client';

import { AdminListTemplate } from '@/design-system';
import { Building, Plus } from 'lucide-react';
import { useAdminBrands } from '@/hooks/useAdminBrands';
import { BrandsTable } from '@/design-system';

export default function AdminBrandsPage() {
  const { brands, stats, loading, searchQuery, setSearchQuery } = useAdminBrands();

  return (
    <AdminListTemplate
      title="Brands Management"
      subtitle="Manage brand partnerships and sponsorships"
      loading={loading}
      stats={[
        { label: 'Total Brands', value: stats.total },
        { label: 'Active Partnerships', value: stats.active },
        { label: 'Total Value', value: `$${stats.total_value.toLocaleString()}` },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search brands..."
      primaryAction={{ label: 'Add Brand', icon: <Plus />, href: '/admin/brands/create' }}
      empty={{
        icon: <Building />,
        title: 'No brands found',
        description: 'Add your first brand partnership',
        action: { label: 'Add Brand', href: '/admin/brands/create' },
      }}
    >
      <BrandsTable brands={brands} />
    </AdminListTemplate>
  );
}
