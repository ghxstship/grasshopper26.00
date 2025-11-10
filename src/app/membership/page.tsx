'use client';

import { MembershipLayout } from '@/design-system/components/templates/MembershipLayout/MembershipLayout';
import { SiteHeader } from '@/design-system/components/organisms/layout/site-header';
import { SiteFooter } from '@/design-system/components/organisms/layout/site-footer';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { useMembershipTiers } from '@/hooks/useMembershipTiers';
import { MembershipTierCard } from '@/design-system/components/organisms/MembershipTierCard/MembershipTierCard';
import styles from './membership.module.css';

export default function MembershipPage() {
  const { tiers, loading } = useMembershipTiers();

  return (
    <MembershipLayout
      header={<SiteHeader />}
      hero={
        <div className={styles.hero}>
          <Typography variant="hero" as="h1">
            Membership Tiers
          </Typography>
          <Typography variant="h3" as="p" className={styles.heroSubtitle}>
            Join GVTEWAY and unlock exclusive benefits
          </Typography>
        </div>
      }
      tiers={
        <div className={styles.tiersGrid}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.tierSkeleton} />
            ))
          ) : (
            tiers.map((tier) => (
              <MembershipTierCard key={tier.id} tier={tier} />
            ))
          )}
        </div>
      }
      footer={<SiteFooter />}
    />
  );
}
