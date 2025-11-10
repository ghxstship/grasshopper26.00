'use client';

import { AdminListTemplate } from '@/design-system/components/templates';
import { Settings, Plus } from 'lucide-react';
import { useKPIConfig } from '@/hooks/useKPIConfig';
import { ConfigTable } from '@/design-system/components/organisms/kpi/config-table';

export default function KPIConfigPage() {
  const { configs, stats, loading } = useKPIConfig();

  return (
    <AdminListTemplate
      title="KPI Configuration"
      subtitle="Configure KPI metrics and thresholds"
      loading={loading}
      primaryAction={{ label: 'Create KPI', icon: <Plus />, href: '/admin/kpi-config/create' }}
    >
      <ConfigTable configs={configs} />
    </AdminListTemplate>
  );
}
