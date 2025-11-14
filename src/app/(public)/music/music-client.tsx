/**
 * Music Client - Artists page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Heading } from '@/design-system';
import { ArtistsGrid } from '@/design-system';
import { PageTemplate } from '@/design-system';

interface Artist {
  id: string;
  name: string;
  slug: string;
  genre?: string;
  image_url?: string;
  upcoming_events_count?: number;
}

interface MusicClientProps {
  artists: Artist[];
}

export function MusicClient({ artists }: MusicClientProps) {
  const navItems = [
    { label: 'Events', href: '/events' },
    { label: 'Music', href: '/music' },
    { label: 'Shop', href: '/shop' },
    { label: 'Membership', href: '/membership' },
  ];

  const formatArtistCard = (artist: Artist) => ({
    name: artist.name,
    slug: artist.slug,
    genre: artist.genre,
    image: artist.image_url,
    upcomingEvents: artist.upcoming_events_count,
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
          Artists
        </Heading>

        <ArtistsGrid
          artists={artists.map(formatArtistCard)}
          columns={4}
        />
      </Stack>
    </PageTemplate>
  );
}
