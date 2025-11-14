/**
 * Artist Detail Client
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Heading, Text, Card } from '@/design-system';
import { PageTemplate } from '@/design-system';

interface ArtistDetailClientProps {
  artist: any;
}

export function ArtistDetailClient({ artist }: ArtistDetailClientProps) {
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
            {artist.name}
          </Heading>
          {artist.bio && (
            <Text size="lg" color="secondary">
              {artist.bio}
            </Text>
          )}
        </Stack>

        {artist.genre_tags && artist.genre_tags.length > 0 && (
          <Card variant="outlined" padding={4}>
            <Stack gap={2}>
              <Heading level={3} font="bebas">
                Genres
              </Heading>
              <Text>{artist.genre_tags.join(', ')}</Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </PageTemplate>
  );
}
