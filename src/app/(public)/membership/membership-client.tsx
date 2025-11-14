/**
 * Membership Client - Membership page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Heading, Text, Grid } from '@/design-system';
import { PricingCard } from '@/design-system';
import { PageTemplate } from '@/design-system';
import styles from './membership.module.css';

export function MembershipClient() {
  const navItems = [
    { label: 'Events', href: '/events' },
    { label: 'Music', href: '/music' },
    { label: 'Shop', href: '/shop' },
    { label: 'Membership', href: '/membership' },
  ];

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Get started with basic access',
      features: [
        { text: 'Browse events', included: true },
        { text: 'Purchase tickets', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Priority access', included: false },
        { text: 'Exclusive events', included: false },
        { text: 'Member discounts', included: false },
      ],
      ctaText: 'Sign Up Free',
    },
    {
      name: 'Member',
      price: '$9.99',
      period: '/month',
      description: 'Enhanced access and benefits',
      features: [
        { text: 'Browse events', included: true },
        { text: 'Purchase tickets', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Priority access', included: true },
        { text: 'Exclusive events', included: true },
        { text: 'Member discounts', included: true },
      ],
      ctaText: 'Become a Member',
      featured: true,
    },
    {
      name: 'VIP',
      price: '$29.99',
      period: '/month',
      description: 'Ultimate access and perks',
      features: [
        { text: 'Browse events', included: true },
        { text: 'Purchase tickets', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Priority access', included: true },
        { text: 'Exclusive events', included: true },
        { text: 'Member discounts', included: true },
        { text: 'VIP lounge access', included: true },
        { text: 'Meet & greets', included: true },
        { text: 'Concierge service', included: true },
      ],
      ctaText: 'Go VIP',
    },
  ];

  return (
    <PageTemplate
      headerProps={{
        logoText: 'GVTEWAY',
        navItems,
        showAuth: true,
      }}
    >
      <Stack gap={12}>
        <Stack gap={4} align="center">
          <Heading level={1} font="anton" align="center">
            Membership
          </Heading>
          <Text size="xl" align="center" color="secondary" className={styles.description}>
            Choose the membership tier that fits your lifestyle and unlock exclusive access to
            premium events and experiences.
          </Text>
        </Stack>

        <Grid columns={3} gap={8} responsive>
          {tiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </Grid>
      </Stack>
    </PageTemplate>
  );
}
