'use client';

import { PortalDashboardTemplate } from '@/design-system';
import { Users, Gift, TrendingUp } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { ReferralsList } from '@/design-system';

export default function ReferralsPage() {
  const { stats, referrals, loading } = useReferrals();

  return (
    <PortalDashboardTemplate
      greeting="Referral Program"
      userInfo={<span>Invite friends and earn rewards</span>}
      statsCards={[
        { label: 'Total Referrals', value: stats.total, icon: <Users /> },
        { label: 'Active Members', value: stats.active, icon: <TrendingUp /> },
        { label: 'Rewards Earned', value: `$${stats.rewards}`, icon: <Gift /> },
      ]}
      sections={[
        {
          id: 'referrals',
          title: 'Your Referrals',
          content: <ReferralsList referrals={referrals} />,
          isEmpty: referrals.length === 0,
          emptyState: {
            icon: <Users />,
            title: 'No referrals yet',
            description: 'Share your referral link to start earning rewards',
          },
        },
      ]}
      layout="single-column"
      loading={loading}
    />
  );
}
