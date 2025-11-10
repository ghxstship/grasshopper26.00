'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicBrowseTemplate } from '@/design-system/components/templates';
import { Calendar } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/design-system/components/organisms/events/event-card';

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
    <PublicBrowseTemplate
      title="DISCOVER EVENTS"
      subtitle="Find your next unforgettable experience"
      heroGradient={true}
      searchPlaceholder="Search events, venues..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showSearch={true}
      sortOptions={[
        { value: 'date-asc', label: 'Date (Earliest First)' },
        { value: 'date-desc', label: 'Date (Latest First)' },
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'price-asc', label: 'Price (Low to High)' },
        { value: 'price-desc', label: 'Price (High to Low)' },
      ]}
      sortValue={sortBy}
      onSortChange={(value) => setSortBy(value as any)}
      items={filteredEvents}
      renderItem={(event) => <EventCard event={event} />}
      gridColumns={3}
      gap="lg"
      showResultsCount={true}
      totalCount={events.length}
      emptyState={{
        icon: <Calendar />,
        title: "No events found",
        description: "Try adjusting your search or filters",
        action: {
          label: "Clear Filters",
          onClick: clearFilters,
        },
      }}
      loading={loading}
      loadingCount={6}
    />
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPageContent />
    </Suspense>
  );
}
