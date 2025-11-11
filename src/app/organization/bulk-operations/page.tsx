'use client';

import { AdminListTemplate } from '@/design-system/components/templates';
import { Zap, Plus } from 'lucide-react';
import { useAdminBulkOps } from '@/hooks/useAdminBulkOps';
import { BulkOpsTable } from '@/design-system/components/organisms/admin/bulk-ops-table';

export default function AdminBulkOperationsPage() {
  const { operations, stats, loading } = useAdminBulkOps();

  return (
    <AdminListTemplate
      title="Bulk Operations"
      subtitle="Manage batch operations and imports"
      loading={loading}
      stats={[
        { label: 'Total Operations', value: stats.total },
        { label: 'Completed', value: stats.completed },
        { label: 'In Progress', value: stats.in_progress },
      ]}
      primaryAction={{ label: 'New Operation', icon: <Plus />, href: '/admin/bulk-operations/create' }}
      empty={{
        icon: <Zap />,
        title: 'No operations',
        description: 'Create your first bulk operation',
      }}
    >
      <BulkOpsTable operations={operations} />
    </AdminListTemplate>
  );
}
