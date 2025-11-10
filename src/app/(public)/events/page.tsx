'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { EventCard } from '@/design-system/components/organisms/EventCard/EventCard';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
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
    clearFilters,
    events,
  } = useEvents({
    initialSearch: searchParams.get('search') || '',
  });


  return (
    <GridLayout
      title="Discover Events"
      description="Find your next unforgettable experience"
      search={
        <Input
          type="search"
          placeholder="Search events, venues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      }
      columns={3}
    >
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: '400px', background: 'var(--color-bg-secondary)' }} />
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
              href={`/events/${event.id}`}
              price={minPrice ? `$${minPrice.toFixed(2)}` : undefined}
            />
          );
        })
      ) : (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)' }}>
          <Typography variant="h3" as="p">
            No events found
          </Typography>
          <Typography variant="body" as="p">
            Try adjusting your search
          </Typography>
        </div>
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
