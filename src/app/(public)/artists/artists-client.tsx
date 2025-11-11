'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { ArtistCard } from '@/design-system/components/molecules/ArtistCard/ArtistCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { FilterBar } from '@/design-system/components/molecules/FilterBar/FilterBar';
import styles from './artists.module.css';

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
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Get unique genres
  const allGenres = Array.from(
    new Set(initialArtists.flatMap(a => a.genre_tags || []))
  ).sort();

  const genreFilters = allGenres.map(genre => ({
    id: genre,
    label: genre,
    count: initialArtists.filter(a => a.genre_tags?.includes(genre)).length,
  }));

  // Filter and sort artists
  let filteredArtists = initialArtists.filter(artist => {
    const matchesSearch = searchQuery
      ? artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesGenre = selectedGenres.length === 0 ||
      selectedGenres.some(genre => artist.genre_tags?.includes(genre));
    
    return matchesSearch && matchesGenre;
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

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId]
    );
  };

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h1" as="h1">
          Discover Artists
        </Typography>
        <Typography variant="body" as="p" className={styles.description}>
          Discover the incredible talent performing at GVTEWAY events
        </Typography>
      </div>

      <div className={styles.controls}>
        <SearchBar
          placeholder="Search artists..."
          value={searchQuery}
          onChange={setSearchQuery}
          fullWidth
        />
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          label="Sort By"
          selectSize="md"
        />
      </div>

      {genreFilters.length > 0 && (
        <div className={styles.filters}>
          <FilterBar
            filters={genreFilters}
            selectedFilters={selectedGenres}
            onFilterChange={handleGenreToggle}
            label="Genres"
          />
        </div>
      )}

      <div className={styles.results}>
        <Typography variant="body" as="p">
          Showing {filteredArtists.length} of {initialArtists.length} artists
        </Typography>
      </div>

      <div className={styles.grid}>
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
          <div className={styles.emptyState}>
            <Typography variant="h3" as="p">
              No artists found
            </Typography>
            <Typography variant="body" as="p">
              Try adjusting your search or filters
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
