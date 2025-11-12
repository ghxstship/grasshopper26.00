'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
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
    priority_support: 'Priority support',
    all_access: 'All Access benefits',
    quarterly_credits: 'Quarterly ticket credits',
    member_lounges: 'Member lounge access',
    exclusive_content: 'Exclusive content',
    vip_upgrades: 'VIP upgrade credits',
    all_plus: 'All Plus benefits',
    exclusive_events: 'Exclusive member events',
    concierge_support: '24/7 concierge support',
    skip_line: 'Skip the line access',
    guest_privileges: 'Guest privileges',
    backstage_access: 'Backstage access',
  };

  return Object.entries(benefits)
    .filter(([_, value]) => value === true)
    .map(([key]) => benefitLabels[key] || key.replace(/_/g, ' '))
    .filter(Boolean);
}

export function MembershipBrowseClient({ initialTiers }: MembershipBrowseClientProps) {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);

  // Mark tier_level 2 (Plus) as featured
  const tiersWithBenefits = initialTiers.map((tier) => ({
    ...tier,
    benefits: transformBenefits(tier.benefits),
    featured: tier.tier_level === 2,
  }));

  const specialDiscounts = [
    {
      type: 'Student',
      discount: '25% OFF',
      description: 'Valid student ID required',
    },
    {
      type: 'Educator',
      discount: '25% OFF',
      description: 'Valid educator ID required',
    },
    {
      type: 'Veteran',
      discount: '25% OFF',
      description: 'Valid military ID required',
    },
    {
      type: 'Senior',
      discount: '25% OFF',
      description: 'Valid ID required (65+)',
    },
  ];

  const faqItems = [
    {
      id: '1',
      question: 'How do membership tiers work?',
      answer: 'Each tier unlocks progressively more benefits, from basic event browsing to VIP backstage access. Choose the tier that fits your event-going lifestyle.',
    },
    {
      id: '2',
      question: 'What is a Companion Pass?',
      answer: 'A Companion Pass allows you to add a guest who shares most of your membership benefits. Perfect for bringing a partner, friend, or family member to events. Available as a monthly add-on for Plus and Extra tiers only.',
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
    {
      id: '6',
      question: 'How do I qualify for special discounts?',
      answer: 'Students, educators, veterans, and seniors (65+) receive 25% off all membership tiers. You\'ll need to verify your eligibility with a valid ID during checkout.',
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
    <>
      {/* Hero Section */}
      <div className={styles.hero}>
        <Typography variant="h1" as="h1" className={styles.heroTitle}>
          Join GVTEWAY
        </Typography>
        <Typography variant="h3" as="p" className={styles.heroSubtitle}>
          Unlock exclusive access to the best events and experiences
        </Typography>
      </div>

      {/* Billing Toggle */}
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
          <span className={styles.savingsBadge}>Save 2 Months</span>
        )}
      </div>

      {/* Membership Tiers Grid */}
      <GridLayout
        title="Memberships"
        description="Unlock exclusive benefits and experiences"
        columns={3}
      >
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
      </GridLayout>

      {/* Benefits Section */}
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

      {/* Special Discounts Section */}
      <div className={styles.discountsSection}>
        <Typography variant="h2" as="h2" className={styles.sectionTitle}>
          Special Discounts
        </Typography>
        <div className={styles.discountsGrid}>
          {specialDiscounts.map((discount, idx) => (
            <div key={idx} className={styles.discountCard}>
              <div className={styles.discountType}>{discount.type}</div>
              <div className={styles.discountAmount}>{discount.discount}</div>
              <div className={styles.discountDescription}>{discount.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Section */}
      <div className={styles.corporateSection}>
        <Typography variant="h2" as="h2">
          Corporate Memberships
        </Typography>
        <Typography variant="body" as="p">
          Custom packages available for businesses and organizations
        </Typography>
        <Button
          variant="outlined"
          size="lg"
          onClick={() => window.location.href = 'mailto:support@gvteway.com?subject=Corporate%20Membership%20Inquiry'}
        >
          Contact Sales
        </Button>
      </div>

      {/* Industry Section */}
      <div className={styles.industrySection}>
        <Typography variant="h2" as="h2">
          Industry Memberships
        </Typography>
        <Typography variant="body" as="p">
          For Organizer Teams, Production Crews & Event Staff
        </Typography>
        <Button
          variant="filled"
          size="lg"
          onClick={() => window.open('https://atlvs.one', '_blank')}
        >
          Explore ATLVS
        </Button>
      </div>

      {/* FAQ Section */}
      <div className={styles.faqSection}>
        <Typography variant="h2" as="h2" className={styles.sectionTitle}>
          Frequently Asked Questions
        </Typography>
        <FAQAccordion items={faqItems} />
      </div>

      {/* CTA Section */}
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
    </>
  );
}
