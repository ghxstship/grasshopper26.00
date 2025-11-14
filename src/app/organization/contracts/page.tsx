'use client';

import { AdminListTemplate } from '@/design-system';
import { FileText, Plus } from 'lucide-react';
import { useAdminContracts } from '@/hooks/useAdminContracts';
import { ContractsTable } from '@/design-system';

export default function ContractsPage() {
  const { contracts, stats, loading, searchQuery, setSearchQuery } = useAdminContracts();

  return (
    <AdminListTemplate
      title="Contracts Management"
      subtitle="Manage vendor and service contracts"
      loading={loading}
      stats={[
        { label: 'Total Contracts', value: stats.total },
        { label: 'Active', value: stats.active },
        { label: 'Pending Signature', value: stats.pending },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search contracts..."
      primaryAction={{ label: 'Create Contract', icon: <Plus />, href: '/organization/contracts/new' }}
      empty={{
        icon: <FileText />,
        title: 'No contracts found',
        description: 'Create your first contract to get started',
        action: { label: 'Create Contract', href: '/organization/contracts/new' },
      }}
    >
      <ContractsTable contracts={contracts} />
    </AdminListTemplate>
  );
}
