'use client';

import { AdminListTemplate } from '@/design-system';
import { Megaphone, Plus } from 'lucide-react';
import { useAdminCampaigns } from '@/hooks/useAdminCampaigns';
import { CampaignsTable } from '@/design-system';

export default function CampaignsPage() {
  const { campaigns, stats, loading, searchQuery, setSearchQuery } = useAdminCampaigns();

  return (
    <AdminListTemplate
      title="Marketing Campaigns"
      subtitle="Manage marketing campaigns and promotions"
      loading={loading}
      stats={[
        { label: 'Total Campaigns', value: stats.total },
        { label: 'Active', value: stats.active },
        { label: 'Total Reach', value: stats.total_reach.toLocaleString() },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search campaigns..."
      primaryAction={{ label: 'Create Campaign', icon: <Plus />, href: '/organization/marketing/campaigns/new' }}
      empty={{
        icon: <Megaphone />,
        title: 'No campaigns found',
        description: 'Create your first marketing campaign',
        action: { label: 'Create Campaign', href: '/organization/marketing/campaigns/new' },
      }}
    >
      <CampaignsTable campaigns={campaigns} />
    </AdminListTemplate>
  );
}
