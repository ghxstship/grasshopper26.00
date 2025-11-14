/**
 * Events Client - Events listing page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Heading } from '@/design-system';
import { EventsGrid } from '@/design-system';
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

interface EventsClientProps {
  events: Event[];
}

export function EventsClient({ events }: EventsClientProps) {
  const navItems = [
    { label: 'Events', href: '/events' },
    { label: 'Music', href: '/music' },
    { label: 'Shop', href: '/shop' },
    { label: 'Membership', href: '/membership' },
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
    >
      <Stack gap={8}>
        <Heading level={1} font="anton">
          All Events
        </Heading>

        <EventsGrid
          events={events.map(formatEventCard)}
          columns={3}
        />
      </Stack>
    </PageTemplate>
  );
}
