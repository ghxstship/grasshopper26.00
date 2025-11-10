'use client';

import { AdminDashboardTemplate } from '@/design-system/components/templates';
import { Building, DollarSign, Eye, TrendingUp } from 'lucide-react';
import { useSponsorAnalytics } from '@/hooks/useSponsorAnalytics';

export default function SponsorAnalyticsPage() {
  const { stats, loading } = useSponsorAnalytics();

  return (
    <AdminDashboardTemplate
      title="Sponsor Analytics"
      subtitle="Sponsorship performance and ROI"
      loading={loading}
      stats={[
        { label: 'Total Sponsors', value: stats.total_sponsors, icon: <Building /> },
        { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: <DollarSign /> },
        { label: 'Impressions', value: stats.impressions.toLocaleString(), icon: <Eye /> },
        { label: 'Engagement', value: `${stats.engagement}%`, icon: <TrendingUp /> },
      ]}
      tabs={[
        { key: 'overview', label: 'Overview', content: <div>Sponsor overview</div> },
        { key: 'roi', label: 'ROI Analysis', content: <div>ROI metrics</div> },
      ]}
    />
  );
}
