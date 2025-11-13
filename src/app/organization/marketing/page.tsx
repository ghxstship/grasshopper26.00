/**
 * Organization Marketing Page
 * Marketing campaigns and analytics
 */

'use client';

import { AdminListTemplate } from '@/design-system/components/templates/AdminListTemplate/AdminListTemplate';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Megaphone, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAdminMarketing } from '@/hooks/useAdminMarketing';

export default function MarketingPage() {
  const { campaigns, stats, loading, searchQuery, setSearchQuery } = useAdminMarketing();

  return (
    <AdminListTemplate
      sidebar={<AdminSidebar />}
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
              <Typography variant="body">{campaign.name}</Typography>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
