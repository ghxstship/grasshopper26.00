'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { SiteHeader } from '@/design-system/components/organisms/layout/site-header';
import { SiteFooter } from '@/design-system/components/organisms/layout/site-footer';
import { ArtistCard } from '@/design-system/components/organisms/ArtistCard/ArtistCard';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { ArtistGrid } from '@/design-system/components/organisms/ArtistGrid/ArtistGrid';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import styles from './artists.module.css';

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    initialArtists.forEach(artist => {
      artist.genre_tags?.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [initialArtists]);

  const filters = allGenres.map(genre => ({
    id: genre,
    label: genre.toUpperCase(),
    count: initialArtists.filter(a => a.genre_tags?.includes(genre)).length,
  }));

  const filteredArtists = initialArtists
    .filter(artist => {
      const matchesSearch = searchQuery
        ? artist.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesGenre = selectedFilters.length === 0 ||
        artist.genre_tags?.some(tag => selectedFilters.includes(tag));
      return matchesSearch && matchesGenre;
    });

  const mappedArtists = filteredArtists.map(artist => ({
    id: artist.id,
    name: artist.name,
    genre: artist.genre_tags || [],
    imageUrl: artist.image_url || '/placeholder-artist.jpg',
  }));

  const handleFilterChange = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <div className={styles.container}>
      <SiteHeader />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>ARTISTS</h1>
          <p className={styles.subtitle}>DISCOVER THE INCREDIBLE TALENT PERFORMING AT GVTEWAY EVENTS</p>
        </div>

        <div className={styles.searchContainer}>
          <SearchBar
            placeholder="SEARCH ARTISTS..."
            value={searchQuery}
            onChange={setSearchQuery}
            fullWidth
          />
        </div>

        <ArtistGrid
          artists={mappedArtists}
          onArtistClick={(id) => router.push(`/artists/${id}`)}
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          variant="circle"
        />
      </main>

      <SiteFooter />
    </div>
  );
}
