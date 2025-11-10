'use client';

import { PortalDashboardTemplate } from '@/design-system/components/templates';
import { Coins, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { CreditsList } from '@/design-system/components/organisms/credits/credits-list';

export default function CreditsPage() {
  const { stats, credits, loading } = useCredits();

  return (
    <PortalDashboardTemplate
      greeting="Ticket Credits"
      userInfo={<span>Manage your membership credits</span>}
      statsCards={[
        { label: 'Available Credits', value: stats.available_credits, icon: <Coins /> },
        { label: 'Total Earned', value: stats.total_credits, icon: <TrendingUp /> },
        { label: 'Expiring Soon', value: stats.expiring_soon, icon: <AlertCircle />, trend: stats.expiring_soon > 0 ? { value: stats.expiring_soon, direction: 'down' as const } : undefined },
        { label: 'Expired', value: stats.expired_credits, icon: <Clock /> },
      ]}
      sections={[
        {
          id: 'credits',
          title: 'Credit History',
          content: <CreditsList credits={credits} />,
          isEmpty: credits.length === 0,
          emptyState: {
            icon: <Coins />,
            title: 'No credits yet',
            description: 'Credits will appear here when you earn them through your membership',
          },
        },
      ]}
      layout="single-column"
      loading={loading}
    />
  );
}
