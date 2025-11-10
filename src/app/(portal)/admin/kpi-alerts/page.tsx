'use client';

import { AdminListTemplate } from '@/design-system/components/templates';
import { Bell, Plus } from 'lucide-react';
import { useKPIAlerts } from '@/hooks/useKPIAlerts';
import { AlertsTable } from '@/design-system/components/organisms/kpi/alerts-table';

export default function KPIAlertsPage() {
  const { alerts, stats, loading } = useKPIAlerts();

  return (
    <AdminListTemplate
      title="KPI Alerts"
      subtitle="Manage performance alerts and notifications"
      loading={loading}
      primaryAction={{ label: 'Create Alert', icon: <Plus />, href: '/admin/kpi-alerts/create' }}
    >
      <AlertsTable alerts={alerts} />
    </AdminListTemplate>
  );
}
