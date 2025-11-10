'use client';

import { AdminDashboardTemplate } from '@/design-system/components/templates';
import { BarChart, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';

export default function AdminAnalyticsPage() {
  const { stats, loading } = useAdminAnalytics();

  return (
    <AdminDashboardTemplate
      title="Analytics"
      subtitle="Platform performance and insights"
      loading={loading}
      stats={[
        { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <DollarSign />, trend: { value: 18, direction: 'up', label: '+18%' } },
        { label: 'Active Users', value: stats.active_users, icon: <Users />, trend: { value: 12, direction: 'up', label: '+12%' } },
        { label: 'Conversion Rate', value: `${stats.conversion_rate}%`, icon: <TrendingUp />, trend: { value: 5, direction: 'up', label: '+5%' } },
        { label: 'Avg Order Value', value: `$${stats.avg_order_value}`, icon: <BarChart />, trend: { value: 8, direction: 'up', label: '+8%' } },
      ]}
      tabs={[
        { key: 'overview', label: 'Overview', content: <div>Overview charts</div> },
        { key: 'revenue', label: 'Revenue', content: <div>Revenue charts</div> },
        { key: 'users', label: 'Users', content: <div>User charts</div> },
      ]}
    />
  );
}
