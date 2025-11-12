'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering
if (typeof window === 'undefined') {
  // This ensures the page is not statically generated
}
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { EventCard } from '@/design-system/components/organisms/EventCard/EventCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { Pagination } from '@/design-system/components/molecules/Pagination/Pagination';
import { useEvents } from '@/hooks/useEvents';

const ITEMS_PER_PAGE = 12;

function EventsPageContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const {
    filteredEvents,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    events,
  } = useEvents({
    initialSearch: searchParams.get('search') || '',
  });

  const sortOptions = [
    { value: 'date-asc', label: 'Date (Earliest First)' },
    { value: 'date-desc', label: 'Date (Latest First)' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
  ];

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as any);
    setCurrentPage(1);
  };

  return (
    <GridLayout
      title="Events"
      description="Discover upcoming events and experiences"
      search={
        <SearchBar
          placeholder="Search events, venues..."
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
          <Skeleton key={i} variant="rectangular" height="25rem" />
        ))
      ) : paginatedEvents.length > 0 ? (
        paginatedEvents.map((event) => {
          const minPrice = event.ticket_types && event.ticket_types.length > 0
            ? Math.min(...event.ticket_types.map(tt => parseFloat(tt.price)))
            : null;
          
          return (
            <EventCard
              key={event.id}
              title={event.name}
              description={event.description}
              imageUrl={event.hero_image_url || '/placeholder.jpg'}
              imageAlt={event.name}
              date={new Date(event.start_date).toLocaleDateString()}
              location={event.venue_name || 'TBA'}
              href={`/events/${event.slug}`}
              price={minPrice ? `$${minPrice.toFixed(2)}` : undefined}
            />
          );
        })
      ) : (
        <Typography variant="h3" as="p" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)' }}>
          No events found
        </Typography>
      )}
    </GridLayout>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPageContent />
    </Suspense>
  );
}
