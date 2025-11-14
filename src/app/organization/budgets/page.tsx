'use client';

import { AdminListTemplate } from '@/design-system';
import { DollarSign, Plus } from 'lucide-react';
import { useAdminBudgets } from '@/hooks/useAdminBudgets';
import { BudgetsTable } from '@/design-system';

export default function BudgetsPage() {
  const { budgets, stats, loading, searchQuery, setSearchQuery } = useAdminBudgets();

  return (
    <AdminListTemplate
      title="Budgets Management"
      subtitle="Manage event budgets and financial planning"
      loading={loading}
      stats={[
        { label: 'Total Budgets', value: stats.total },
        { label: 'Active', value: stats.active },
        { label: 'Total Value', value: `$${stats.total_value.toLocaleString()}` },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search budgets..."
      primaryAction={{ label: 'Create Budget', icon: <Plus />, href: '/organization/budgets/new' }}
      empty={{
        icon: <DollarSign />,
        title: 'No budgets found',
        description: 'Create your first budget to get started',
        action: { label: 'Create Budget', href: '/organization/budgets/new' },
      }}
    >
      <BudgetsTable budgets={budgets} />
    </AdminListTemplate>
  );
}
