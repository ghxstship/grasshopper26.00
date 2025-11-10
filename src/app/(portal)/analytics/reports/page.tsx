'use client';

import { AdminListTemplate } from '@/design-system/components/templates';
import { FileText, Plus } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { ReportsTable } from '@/design-system/components/organisms/reports/reports-table';

export default function ReportsPage() {
  const { reports, stats, loading } = useReports();

  return (
    <AdminListTemplate
      title="Reports"
      subtitle="Generate and view analytics reports"
      loading={loading}
      primaryAction={{ label: 'Create Report', icon: <Plus />, href: '/analytics/reports/create' }}
    >
      <ReportsTable reports={reports} />
    </AdminListTemplate>
  );
}
