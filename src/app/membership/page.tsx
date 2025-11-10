'use client';

import { PublicBrowseTemplate } from '@/design-system/components/templates';
import { Crown } from 'lucide-react';
import { useMembershipTiers } from '@/hooks/useMembershipTiers';
import { MembershipTierCard } from '@/design-system/components/organisms/membership/tier-card';

export default function MembershipPage() {
  const { tiers, loading } = useMembershipTiers();

  return (
    <PublicBrowseTemplate
      title="MEMBERSHIP TIERS"
      subtitle="Join GVTEWAY and unlock exclusive benefits"
      heroGradient={true}
      items={tiers}
      renderItem={(tier) => <MembershipTierCard tier={tier} />}
      gridColumns={3}
      gap="lg"
      loading={loading}
      emptyState={{
        icon: <Crown />,
        title: "No tiers available",
        description: "Check back soon",
      }}
    />
  );
}
