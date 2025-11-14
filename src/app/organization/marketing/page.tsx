/**
 * Organization Marketing Page
 * Marketing campaigns and analytics
 */

'use client';

import { Text } from '@/design-system';
import { AdminListTemplate } from '@/design-system';
import { Megaphone, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAdminMarketing } from '@/hooks/useAdminMarketing';

export default function MarketingPage() {
  const { campaigns, stats, loading, searchQuery, setSearchQuery } = useAdminMarketing();

  return (
    <AdminListTemplate
      title="Marketing & Campaigns"
      description="Manage marketing campaigns and analytics"
      stats={[
        { label: 'Total Campaigns', value: stats.total, icon: <Megaphone /> },
        { label: 'Active', value: stats.active, icon: <TrendingUp /> },
        { label: 'Impressions', value: stats.impressions.toLocaleString(), icon: <Users /> },
        { label: 'Conversions', value: stats.conversions, icon: <DollarSign /> },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search campaigns..."
      loading={loading}
      empty={{
        icon: <Megaphone />,
        title: 'No campaigns yet',
        description: 'Create your first marketing campaign to get started',
      }}
    >
      {campaigns && campaigns.length > 0 && (
        <div>
          {campaigns.map((campaign) => (
            <div key={campaign.id}>
              <Text>{campaign.name}</Text>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
