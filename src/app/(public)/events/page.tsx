'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { EventCard } from '@/design-system/components/organisms/EventCard/EventCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { useEvents } from '@/hooks/useEvents';
import { Filter, X } from 'lucide-react';
import styles from './events.module.css';

function EventsPageContent() {
  const searchParams = useSearchParams();
  const {
    filteredEvents,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    clearFilters,
    events,
  } = useEvents({
    initialSearch: searchParams.get('search') || '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'date-asc', label: 'Date (Earliest First)' },
    { value: 'date-desc', label: 'Date (Latest First)' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'on-sale', label: 'On Sale' },
    { value: 'sold-out', label: 'Sold Out' },
  ];

  const hasActiveFilters = searchQuery || sortBy !== 'date-asc' || statusFilter !== 'all';

  return (
    <div className={styles.container}>
      {/* Search and Filter Bar */}
      <div className={styles.searchBar}>
        <SearchBar
          placeholder="Search events, venues..."
          value={searchQuery}
          onChange={setSearchQuery}
          fullWidth
        />
        <Button
          variant="outlined"
          onClick={() => setShowFilters(!showFilters)}
          className={styles.filterButton}
        >
          <Filter style={{ width: 20, height: 20 }} />
          FILTERS
        </Button>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className={styles.filterControls}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <Typography variant="body" as="label" className={styles.filterLabel}>
                SORT BY
              </Typography>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                selectSize="md"
              />
            </div>

            <div className={styles.filterGroup}>
              <Typography variant="body" as="label" className={styles.filterLabel}>
                STATUS
              </Typography>
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                selectSize="md"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className={styles.clearButton}
              >
                <X style={{ width: 16, height: 16 }} />
                CLEAR FILTERS
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Counter */}
      <div className={styles.resultsCounter}>
        <Typography variant="body" as="p">
          Showing {filteredEvents.length} of {events.length} events
        </Typography>
      </div>

      {/* Events Grid */}
      <div className={styles.eventsGrid}>
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
          <div className={styles.emptyState}>
            <Typography variant="h3" as="p">
              No events found
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

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPageContent />
    </Suspense>
  );
}
