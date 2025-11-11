'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { ArtistCard } from '@/design-system/components/molecules/ArtistCard/ArtistCard';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  profile_image_url?: string;
  genre_tags?: string[];
}

interface ArtistsBrowseClientProps {
  initialArtists: Artist[];
  initialSearch?: string;
}

export function ArtistsBrowseClient({ initialArtists, initialSearch }: ArtistsBrowseClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');

  const filteredArtists = initialArtists
    .filter(artist => {
      const matchesSearch = searchQuery
        ? artist.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesSearch;
    });

  return (
    <GridLayout
      title="Discover Artists"
      description="Discover the incredible talent performing at GVTEWAY events"
      search={
        <Input
          type="search"
          placeholder="Search artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      }
      columns={3}
    >
      {filteredArtists.length > 0 ? (
        filteredArtists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={{
              id: artist.id,
              name: artist.name,
              genre: artist.genre_tags || [],
              imageUrl: artist.profile_image_url || '/placeholder-artist.jpg',
            }}
            onClick={() => router.push(`/artists/${artist.slug}`)}
            variant="square"
          />
        ))
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)' }}>
          <Typography variant="h3" as="p">
            No artists found
          </Typography>
          <Typography variant="body" as="p">
            Try adjusting your search
          </Typography>
        </div>
      )}
    </GridLayout>
  );
}
