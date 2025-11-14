/**
 * Home Client - Homepage with GHXSTSHIP design system
 */

'use client';

import { Stack } from '@/design-system';
import { Hero, EventsGrid } from '@/design-system';
import { PageTemplate } from '@/design-system';

interface Event {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  location: string;
  image_url?: string;
  ticket_price?: number;
  sold_out?: boolean;
}

interface HomeClientProps {
  featuredEvents: Event[];
  upcomingEvents: Event[];
}

export function HomeClient({ featuredEvents, upcomingEvents }: HomeClientProps) {
  const navItems = [
    { label: 'Events', href: '/events' },
    { label: 'Music', href: '/music' },
    { label: 'Shop', href: '/shop' },
    { label: 'Membership', href: '/membership' },
  ];

  const footerColumns = [
    {
      title: 'Events',
      links: [
        { label: 'Browse Events', href: '/events' },
        { label: 'Artists', href: '/music' },
        { label: 'Venues', href: '/venues' },
      ],
    },
    {
      title: 'Shop',
      links: [
        { label: 'Merchandise', href: '/shop' },
        { label: 'Tickets', href: '/events' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/legal/terms' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'Instagram', href: 'https://instagram.com' },
        { label: 'Twitter', href: 'https://twitter.com' },
        { label: 'Facebook', href: 'https://facebook.com' },
      ],
    },
  ];

  const formatEventCard = (event: Event) => ({
    title: event.title,
    slug: event.slug,
    date: new Date(event.start_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    location: event.location,
    image: event.image_url,
    price: event.ticket_price ? `$${event.ticket_price}` : undefined,
    soldOut: event.sold_out,
  });

  return (
    <PageTemplate
      headerProps={{
        logoText: 'GVTEWAY',
        navItems,
        showAuth: true,
      }}
      footerProps={{
        columns: footerColumns,
        socialLinks: [
          { label: 'IG', href: 'https://instagram.com' },
          { label: 'TW', href: 'https://twitter.com' },
          { label: 'FB', href: 'https://facebook.com' },
        ],
      }}
      maxWidth="full"
    >
      <Stack gap={16}>
        {/* Hero */}
        <Hero
          title="EXCLUSIVE EVENTS & EXPERIENCES"
          subtitle="Join GVTEWAY for premium access to the best events"
          ctaText="Browse Events"
          ctaHref="/events"
          secondaryCtaText="Become a Member"
          secondaryCtaHref="/membership"
        />

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <EventsGrid
            title="Featured Events"
            events={featuredEvents.map(formatEventCard)}
            columns={3}
          />
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <EventsGrid
            title="Upcoming Events"
            events={upcomingEvents.map(formatEventCard)}
            columns={4}
          />
        )}
      </Stack>
    </PageTemplate>
  );
}
