'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { AdventureCard } from '@/design-system/components/organisms/AdventureCard/AdventureCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { Pagination } from '@/design-system/components/molecules/Pagination/Pagination';

const ITEMS_PER_PAGE = 12;

interface Adventure {
  id: string;
  name: string;
  slug: string;
  description?: string;
  adventure_type?: string;
  location_name: string;
  city: string;
  state: string;
  price_range?: string;
  min_price?: number;
  max_price?: number;
  duration_hours?: number;
  difficulty_level?: 'easy' | 'moderate' | 'challenging' | 'expert';
  hero_image_url?: string;
  tags?: string[];
  distance_miles?: number;
}

interface AdventuresBrowseClientProps {
  initialAdventures: Adventure[];
  initialSearch?: string;
}

export function AdventuresBrowseClient({ initialAdventures, initialSearch }: AdventuresBrowseClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('name-asc');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort adventures
  let filteredAdventures = initialAdventures.filter(adventure => {
    const matchesSearch = searchQuery
      ? adventure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adventure.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adventure.location_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesSearch;
  });

  // Sort adventures
  filteredAdventures = [...filteredAdventures].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'distance-asc':
        if (a.distance_miles !== undefined && b.distance_miles !== undefined) {
          return a.distance_miles - b.distance_miles;
        }
        return 0;
      case 'price-asc':
        if (a.min_price !== undefined && b.min_price !== undefined) {
          return a.min_price - b.min_price;
        }
        return 0;
      case 'price-desc':
        if (a.max_price !== undefined && b.max_price !== undefined) {
          return b.max_price - a.max_price;
        }
        return 0;
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'distance-asc', label: 'Distance (Nearest)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
  ];

  // Pagination
  const totalPages = Math.ceil(filteredAdventures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAdventures = filteredAdventures.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <GridLayout
      title="Adventures"
      description="Discover adventures near you"
      search={
        <SearchBar
          placeholder="Search adventures..."
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
        />
      }
      sort={
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          selectSize="md"
        />
      }
      columns={4}
      pagination={
        totalPages > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        ) : undefined
      }
    >
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="400px" />
        ))
      ) : paginatedAdventures.length > 0 ? (
        paginatedAdventures.map((adventure) => (
          <AdventureCard
            key={adventure.id}
            title={adventure.name}
            description={adventure.description}
            imageUrl={adventure.hero_image_url || '/placeholder-adventure.jpg'}
            location={adventure.location_name}
            city={adventure.city}
            href={`/adventures/${adventure.slug}`}
            priceRange={adventure.price_range}
            distance={adventure.distance_miles}
            adventureType={adventure.adventure_type}
            difficulty={adventure.difficulty_level}
            duration={adventure.duration_hours}
            tags={adventure.tags}
          />
        ))
      ) : (
        <Typography variant="h3" as="p" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)' }}>
          No adventures found
        </Typography>
      )}
    </GridLayout>
  );
}
