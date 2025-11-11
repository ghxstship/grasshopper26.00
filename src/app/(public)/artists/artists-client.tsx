'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { ArtistCard } from '@/design-system/components/molecules/ArtistCard/ArtistCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';

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
  const [sortBy, setSortBy] = useState('name-asc');
  const [loading, setLoading] = useState(false);

  // Filter and sort artists
  let filteredArtists = initialArtists.filter(artist => {
    const matchesSearch = searchQuery
      ? artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesSearch;
  });

  // Sort artists
  filteredArtists = [...filteredArtists].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
  ];

  return (
    <GridLayout
      title="Discover Artists"
      description={`Discover the incredible talent performing at GVTEWAY events`}
      search={
        <SearchBar
          placeholder="Search artists..."
          value={searchQuery}
          onChange={setSearchQuery}
          fullWidth
        />
      }
      sort={
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          selectSize="md"
        />
      }
      columns={4}
    >
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="320px" />
        ))
      ) : filteredArtists.length > 0 ? (
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
        <Typography variant="h3" as="p" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)' }}>
          No artists found
        </Typography>
      )}
    </GridLayout>
  );
}
