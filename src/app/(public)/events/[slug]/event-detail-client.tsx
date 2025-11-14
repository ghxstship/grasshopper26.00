/**
 * Event Detail Client
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Heading, Text, Card, Button, Grid } from '@/design-system';
import { PageTemplate } from '@/design-system';
import Link from 'next/link';

interface EventDetailClientProps {
  event: any;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const navItems = [
    { label: 'Events', href: '/events' },
    { label: 'Music', href: '/music' },
    { label: 'Shop', href: '/shop' },
    { label: 'Membership', href: '/membership' },
  ];

  return (
    <PageTemplate
      headerProps={{
        logoText: 'GVTEWAY',
        navItems,
        showAuth: true,
      }}
    >
      <Stack gap={8}>
        <Stack gap={4}>
          <Heading level={1} font="anton">
            {event.name}
          </Heading>
          {event.description && (
            <Text size="lg" color="secondary">
              {event.description}
            </Text>
          )}
        </Stack>

        {event.ticket_types && event.ticket_types.length > 0 && (
          <Stack gap={4}>
            <Heading level={2} font="bebas">
              Tickets
            </Heading>
            <Grid columns={2} gap={4} responsive>
              {event.ticket_types.map((ticketType: any) => (
                <Card key={ticketType.id} variant="outlined" padding={6}>
                  <Stack gap={3}>
                    <Heading level={3} font="bebas">
                      {ticketType.name}
                    </Heading>
                    {ticketType.description && (
                      <Text size="sm" color="secondary">
                        {ticketType.description}
                      </Text>
                    )}
                    <Text size="xl" weight="bold">
                      ${(ticketType.price / 100).toFixed(2)}
                    </Text>
                    <Button variant="primary" fullWidth>
                      Get Tickets
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}

        {event.event_artists && event.event_artists.length > 0 && (
          <Stack gap={4}>
            <Heading level={2} font="bebas">
              Artists
            </Heading>
            <Grid columns={3} gap={4} responsive>
              {event.event_artists.map((eventArtist: any) => (
                <Card key={eventArtist.artist.id} variant="outlined" padding={4}>
                  <Stack gap={2}>
                    <Heading level={4} font="bebas">
                      {eventArtist.artist.name}
                    </Heading>
                    {eventArtist.headliner && (
                      <Text size="sm" weight="bold">
                        Headliner
                      </Text>
                    )}
                    <Link href={`/music/${eventArtist.artist.slug}`}>
                      <Button variant="secondary" size="sm" fullWidth>
                        View Artist
                      </Button>
                    </Link>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}
      </Stack>
    </PageTemplate>
  );
}
