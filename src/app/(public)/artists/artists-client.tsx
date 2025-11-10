'use client';

import { useState } from 'react';
import { PublicBrowseTemplate } from '@/design-system/components/templates';
import { Users } from 'lucide-react';
import { ArtistCard } from '@/design-system/components/organisms/artists/artist-card';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  image_url?: string;
  genre_tags?: string[];
}

interface ArtistsBrowseClientProps {
  initialArtists: Artist[];
  initialSearch?: string;
}

export function ArtistsBrowseClient({ initialArtists, initialSearch }: ArtistsBrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('name-asc');

  const filteredArtists = initialArtists
    .filter(artist =>
      searchQuery
        ? artist.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <PublicBrowseTemplate
      title="ARTISTS"
      subtitle="Discover the incredible talent performing at GVTEWAY events"
      heroGradient={true}
      searchPlaceholder="Search artists..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showSearch={true}
      sortOptions={[
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
      ]}
      sortValue={sortBy}
      onSortChange={setSortBy}
      items={filteredArtists}
      renderItem={(artist) => <ArtistCard artist={artist} />}
      gridColumns={4}
      gap="lg"
      showResultsCount={true}
      totalCount={initialArtists.length}
      emptyState={{
        icon: <Users />,
        title: "No artists found",
        description: "Try adjusting your search",
        action: {
          label: "Clear Search",
          onClick: () => setSearchQuery(''),
        },
      }}
    />
  );
}
