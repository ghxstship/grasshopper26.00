'use client';

import { AdminDashboardTemplate } from '@/design-system/components/templates';
import { TrendingUp, Users, DollarSign, BarChart } from 'lucide-react';
import { useInvestorAnalytics } from '@/hooks/useInvestorAnalytics';

export default function InvestorAnalyticsPage() {
  const { stats, loading } = useInvestorAnalytics();

  return (
    <AdminDashboardTemplate
      title="Investor Analytics"
      subtitle="Performance metrics for investors"
      loading={loading}
      stats={[
        { label: 'Total Investment', value: `$${stats.total_investment.toLocaleString()}`, icon: <DollarSign /> },
        { label: 'ROI', value: `${stats.roi}%`, icon: <TrendingUp />, trend: { value: 5, direction: 'up', label: '+5%' } },
        { label: 'Active Investors', value: stats.active_investors, icon: <Users /> },
        { label: 'Avg Return', value: `${stats.avg_return}%`, icon: <BarChart /> },
      ]}
      tabs={[
        { key: 'overview', label: 'Overview', content: <div>Investor overview</div> },
        { key: 'performance', label: 'Performance', content: <div>Performance metrics</div> },
      ]}
    />
  );
}
