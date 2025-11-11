'use client';

import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { MembershipTierCard } from '@/design-system/components/organisms/MembershipTierCard/MembershipTierCard';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

interface MembershipTier {
  id: string;
  tier_name: string;
  tier_slug: string;
  display_name: string;
  tier_level: number;
  annual_price: number;
  monthly_price: number;
  badge_icon?: string;
  badge_color?: string;
  benefits: Record<string, boolean | string>;
  limits: Record<string, number | boolean | string>;
  is_active: boolean;
}

interface MembershipBrowseClientProps {
  initialTiers: MembershipTier[];
}

// Transform JSONB benefits into readable array
function transformBenefits(benefits: Record<string, boolean | string>): string[] {
  const benefitLabels: Record<string, string> = {
    browse_events: 'Browse all events',
    view_artists: 'View artist profiles',
    email_newsletter: 'Email newsletter',
    save_favorites: 'Save favorite events',
    basic_notifications: 'Basic notifications',
    all_community: 'All Community benefits',
    purchase_tickets: 'Purchase tickets',
    member_presales: 'Member presale access',
    digital_card: 'Digital membership card',
    birthday_discount: 'Birthday discount',
    all_basic: 'All Basic benefits',
    quarterly_credits: 'Quarterly ticket credits',
    member_lounges: 'Member lounge access',
    exclusive_content: 'Exclusive content',
    priority_support: 'Priority support',
    digital_collectibles: 'Digital collectibles',
    all_main: 'All Main benefits',
    vip_upgrades: 'VIP upgrade credits',
    exclusive_events: 'Exclusive member events',
    concierge_support: '24/7 concierge support',
    skip_line: 'Skip the line access',
    guest_privileges: 'Guest privileges',
    all_extra: 'All Extra benefits',
    team_management: 'Team management',
    pooled_tickets: 'Pooled ticket credits',
    private_suites: 'Private suite access',
    account_manager: 'Dedicated account manager',
    custom_branding: 'Custom branding options',
    unlimited_ga: 'Unlimited GA tickets',
    guaranteed_vip: 'Guaranteed VIP access',
    backstage_access: 'Backstage access',
    white_glove_concierge: 'White glove concierge',
    all_access_potential: 'All-access potential',
  };

  return Object.entries(benefits)
    .filter(([_, value]) => value === true)
    .map(([key]) => benefitLabels[key] || key.replace(/_/g, ' '))
    .filter(Boolean);
}

export function MembershipBrowseClient({ initialTiers }: MembershipBrowseClientProps) {
  const router = useRouter();

  // Mark tier_level 2 (Main) as featured
  const tiersWithBenefits = initialTiers.map((tier) => ({
    ...tier,
    benefits: transformBenefits(tier.benefits),
    featured: tier.tier_level === 2,
  }));

  return (
    <GridLayout
      title="Membership Tiers"
      description="Join GVTEWAY and unlock exclusive benefits"
      columns={3}
    >
      {tiersWithBenefits.length > 0 ? (
        tiersWithBenefits.map((tier) => (
          <MembershipTierCard
            key={tier.id}
            tier={tier}
            onClick={() => router.push(`/membership/checkout?tier=${tier.id}`)}
          />
        ))
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)' }}>
          <Typography variant="h3" as="p">
            No membership tiers available
          </Typography>
          <Typography variant="body" as="p">
            Check back soon for membership options
          </Typography>
        </div>
      )}
    </GridLayout>
  );
}
