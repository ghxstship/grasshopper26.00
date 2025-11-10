'use client';

import { AdminDashboardTemplate } from '@/design-system/components/templates';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useKPIAnalytics } from '@/hooks/useKPIAnalytics';

export default function KPIAnalyticsPage() {
  const { stats, loading } = useKPIAnalytics();

  return (
    <AdminDashboardTemplate
      title="KPI Analytics"
      subtitle="Key performance indicators and metrics"
      loading={loading}
      stats={[
        { label: 'Active KPIs', value: stats.active, icon: <Activity />, trend: { value: 5, direction: 'up', label: '+5%' } },
        { label: 'Trending Up', value: stats.trending_up, icon: <TrendingUp />, trend: { value: 10, direction: 'up', label: '+10%' } },
        { label: 'Alerts', value: stats.alerts, icon: <AlertTriangle />, trend: { value: 3, direction: 'down', label: '-3%' } },
        { label: 'On Target', value: stats.on_target, icon: <CheckCircle />, trend: { value: 8, direction: 'up', label: '+8%' } },
      ]}
      tabs={[
        { key: 'overview', label: 'Overview', content: <div>KPI Overview</div> },
        { key: 'trends', label: 'Trends', content: <div>Trend Analysis</div> },
      ]}
    />
  );
}
