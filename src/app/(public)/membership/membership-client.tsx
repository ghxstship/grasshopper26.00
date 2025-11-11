'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MembershipLayout } from '@/design-system/components/templates/MembershipLayout/MembershipLayout';
import { MembershipTierCard } from '@/design-system/components/organisms/MembershipTierCard/MembershipTierCard';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Toggle } from '@/design-system/components/atoms/Toggle/Toggle';
import { FAQAccordion } from '@/design-system/components/organisms/FAQAccordion/FAQAccordion';
import { Check } from 'lucide-react';
import styles from './membership.module.css';

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
  companion_pass?: {
    id: string;
    monthly_price: number;
    annual_price: number;
    max_companions: number;
  };
}

interface MembershipBrowseClientProps {
  initialTiers: MembershipTier[];
  companionPasses?: any[];
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
  const [isAnnual, setIsAnnual] = useState(true);

  // Mark tier_level 2 (Main) as featured
  const tiersWithBenefits = initialTiers.map((tier) => ({
    ...tier,
    benefits: transformBenefits(tier.benefits),
    featured: tier.tier_level === 2,
  }));

  const faqItems = [
    {
      id: '1',
      question: 'How do membership tiers work?',
      answer: 'Each tier unlocks progressively more benefits, from basic event browsing to VIP backstage access. Choose the tier that fits your event-going lifestyle.',
    },
    {
      id: '2',
      question: 'What is a Companion Pass?',
      answer: 'A Companion Pass allows you to add a guest who shares most of your membership benefits. Perfect for bringing a partner, friend, or family member to events. Available as an add-on for all non-business tiers.',
    },
    {
      id: '3',
      question: 'Can I upgrade my membership later?',
      answer: 'Yes! You can upgrade to a higher tier at any time. Your remaining balance will be prorated toward your new membership.',
    },
    {
      id: '4',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital payment methods including Apple Pay and Google Pay.',
    },
    {
      id: '5',
      question: 'Is there a refund policy?',
      answer: 'Annual memberships can be refunded within 30 days of purchase. Monthly memberships can be canceled at any time.',
    },
  ];

  const benefits = [
    'Priority access to tickets',
    'Exclusive member events',
    'Discounts on merchandise',
    'Early venue entry',
    'Member-only content',
    'Birthday perks',
  ];

  return (
    <MembershipLayout
      hero={
        <div className={styles.hero}>
          <Typography variant="h1" as="h1" className={styles.heroTitle}>
            Join GVTEWAY
          </Typography>
          <Typography variant="h3" as="p" className={styles.heroSubtitle}>
            Unlock exclusive access to the best events and experiences
          </Typography>
        </div>
      }
      billingToggle={
        <div className={styles.billingToggle}>
          <Typography variant="body" as="span" className={isAnnual ? styles.active : ''}>
            Annual
          </Typography>
          <Toggle
            checked={!isAnnual}
            onChange={() => setIsAnnual(!isAnnual)}
            aria-label="Toggle billing period"
          />
          <Typography variant="body" as="span" className={!isAnnual ? styles.active : ''}>
            Monthly
          </Typography>
          {isAnnual && (
            <span className={styles.savingsBadge}>Save 20%</span>
          )}
        </div>
      }
      tiers={
        <div className={styles.tiersGrid}>
          {tiersWithBenefits.length > 0 ? (
            tiersWithBenefits.map((tier) => (
              <MembershipTierCard
                key={tier.id}
                tier={tier}
                onClick={() => router.push(`/membership/checkout?tier=${tier.id}`)}
                isAnnual={isAnnual}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <Typography variant="h3" as="p">
                No membership tiers available
              </Typography>
              <Typography variant="body" as="p">
                Check back soon for membership options
              </Typography>
            </div>
          )}
        </div>
      }
      benefits={
        <div className={styles.benefitsSection}>
          <Typography variant="h2" as="h2" className={styles.sectionTitle}>
            Member Benefits
          </Typography>
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, idx) => (
              <div key={idx} className={styles.benefitItem}>
                <Check className={styles.benefitIcon} />
                <Typography variant="body" as="p">
                  {benefit}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      }
      faq={
        <div className={styles.faqSection}>
          <Typography variant="h2" as="h2" className={styles.sectionTitle}>
            Frequently Asked Questions
          </Typography>
          <FAQAccordion items={faqItems} />
        </div>
      }
      cta={
        <div className={styles.ctaSection}>
          <Typography variant="h2" as="h2">
            Ready to Join?
          </Typography>
          <Typography variant="body" as="p">
            Start your membership today and never miss an event
          </Typography>
          <Button
            variant="filled"
            size="lg"
            onClick={() => router.push('/membership/checkout')}
          >
            Get Started
          </Button>
        </div>
      }
    />
  );
}
