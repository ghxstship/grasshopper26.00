'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { EventCard } from '@/design-system/components/organisms/EventCard/EventCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { useEvents } from '@/hooks/useEvents';

function EventsPageContent() {
  const searchParams = useSearchParams();
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

  return (
    <GridLayout
      title="Events"
      description={`Showing ${filteredEvents.length} of ${events.length} events`}
      search={
        <SearchBar
          placeholder="Search events, venues..."
          value={searchQuery}
          onChange={setSearchQuery}
          fullWidth
        />
      }
      sort={
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          selectSize="md"
        />
      }
      columns={4}
    >
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="400px" />
        ))
      ) : filteredEvents.length > 0 ? (
        filteredEvents.map((event) => {
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
