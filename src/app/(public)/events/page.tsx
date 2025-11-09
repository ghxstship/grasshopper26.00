'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { 
  Loader2, 
  Calendar, 
  MapPin, 
  Search, 
  SlidersHorizontal,
  X,
  Heart,
  Share2,
  CalendarPlus
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  venue_address: string;
  hero_image_url: string;
  status: string;
  capacity: number;
  ticket_types: Array<{
    id: string;
    price: string;
    quantity_available: number;
    quantity_sold: number;
  }>;
}

type SortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
type StatusFilter = 'all' | 'upcoming' | 'on-sale' | 'sold-out';

function EventsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEvents();
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, searchQuery, sortBy, statusFilter]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (
            id,
            price,
            quantity_available,
            quantity_sold
          )
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('favorites')
        .select('event_id')
        .eq('user_id', user.id)
        .eq('favoritable_type', 'event');

      if (data) {
        setFavorites(new Set(data.map(f => f.event_id)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.venue_name?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date);
        const isSoldOut = event.ticket_types?.every(tt => 
          tt.quantity_sold >= tt.quantity_available
        );

        switch (statusFilter) {
          case 'upcoming':
            return eventDate > now;
          case 'on-sale':
            return eventDate > now && !isSoldOut;
          case 'sold-out':
            return isSoldOut;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'date-desc':
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc': {
          const priceA = Math.min(...(a.ticket_types?.map(tt => parseFloat(tt.price)) || [Infinity]));
          const priceB = Math.min(...(b.ticket_types?.map(tt => parseFloat(tt.price)) || [Infinity]));
          return priceA - priceB;
        }
        case 'price-desc': {
          const priceA = Math.min(...(a.ticket_types?.map(tt => parseFloat(tt.price)) || [0]));
          const priceB = Math.min(...(b.ticket_types?.map(tt => parseFloat(tt.price)) || [0]));
          return priceB - priceA;
        }
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  };

  const toggleFavorite = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=' + encodeURIComponent('/events'));
        return;
      }

      if (favorites.has(eventId)) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);
        
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            event_id: eventId,
            favoritable_type: 'event',
          });
        
        setFavorites(prev => new Set(prev).add(eventId));
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const addToCalendar = async (event: Event) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=' + encodeURIComponent('/events'));
        return;
      }

      // Check if already in schedule
      const { data: existing } = await supabase
        .from('user_schedules')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', event.id)
        .single();

      if (existing) {
        toast.info('Event already in your schedule');
        return;
      }

      await supabase
        .from('user_schedules')
        .insert({
          user_id: user.id,
          event_id: event.id,
        });

      toast.success('Added to your schedule');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast.error('Failed to add to schedule');
    }
  };

  const shareEvent = async (event: Event) => {
    const url = `${window.location.origin}/events/${event.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('date-asc');
    setStatusFilter('all');
  };

  const getMinPrice = (event: Event) => {
    if (!event.ticket_types || event.ticket_types.length === 0) return null;
    return Math.min(...event.ticket_types.map(tt => parseFloat(tt.price)));
  };

  const isSoldOut = (event: Event) => {
    if (!event.ticket_types || event.ticket_types.length === 0) return false;
    return event.ticket_types.every(tt => tt.quantity_sold >= tt.quantity_available);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center " style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Events
          </h1>
          <p className="text-gray-400 text-lg">
            Find your next unforgettable experience
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search events, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/30 border-purple-500/30 text-white"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-purple-500/30"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-purple-500/20">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Sort By */}
                  <div>
                    <label htmlFor="sort-by" className="text-sm text-gray-400 mb-2 block">Sort By</label>
                    <select
                      id="sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full bg-black/30 border border-purple-500/30 rounded-md px-3 py-2 text-white"
                    >
                      <option value="date-asc">Date (Earliest First)</option>
                      <option value="date-desc">Date (Latest First)</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="price-asc">Price (Low to High)</option>
                      <option value="price-desc">Price (High to Low)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label htmlFor="status-filter" className="text-sm text-gray-400 mb-2 block">Status</label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="w-full bg-black/30 border border-purple-500/30 rounded-md px-3 py-2 text-white"
                    >
                      <option value="all">All Events</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="on-sale">On Sale</option>
                      <option value="sold-out">Sold Out</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full border-purple-500/30"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          Showing {filteredEvents.length} of {events.length} events
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search or filters
              </p>
              <Button onClick={clearFilters} className="" style={{ background: 'var(--gradient-brand-primary)' }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const minPrice = getMinPrice(event);
              const soldOut = isSoldOut(event);
              const isFavorited = favorites.has(event.id);

              return (
                <Card
                  key={event.id}
                  className="bg-black/40 backdrop-blur-lg border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all group"
                >
                  <div className="relative">
                    {/* Event Image */}
                    <Link href={`/events/${event.slug}`}>
                      <div className="relative h-48 overflow-hidden">
                        {event.hero_image_url ? (
                          <Image
                            src={event.hero_image_url}
                            alt={event.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full " style={{ background: 'var(--gradient-brand-dark)' }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>
                    </Link>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        onClick={() => toggleFavorite(event.id)}
                        size="icon"
                        variant="outline"
                        className="bg-black/50 backdrop-blur-lg border-white/20 hover:bg-black/70"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isFavorited ? 'fill-red-500 text-red-500' : 'text-white'
                          }`}
                        />
                      </Button>
                      <Button
                        onClick={() => addToCalendar(event)}
                        size="icon"
                        variant="outline"
                        className="bg-black/50 backdrop-blur-lg border-white/20 hover:bg-black/70"
                      >
                        <CalendarPlus className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        onClick={() => shareEvent(event)}
                        size="icon"
                        variant="outline"
                        className="bg-black/50 backdrop-blur-lg border-white/20 hover:bg-black/70"
                      >
                        <Share2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>

                    {/* Status Badge */}
                    {soldOut && (
                      <div className="absolute top-2 left-2">
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <Link href={`/events/${event.slug}`}>
                      <h3 className="text-xl font-bold text-white mb-2 hover:text-purple-400 transition-colors">
                        {event.name}
                      </h3>
                    </Link>

                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.start_date), 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                      {minPrice !== null ? (
                        <span className="text-lg font-bold text-purple-400">
                          From ${minPrice.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No tickets available</span>
                      )}
                      <Button
                        asChild
                        size="sm"
                        className="" style={{ background: 'var(--gradient-brand-primary)' }}
                        disabled={soldOut}
                      >
                        <Link href={`/events/${event.slug}`}>
                          {soldOut ? 'Sold Out' : 'View Details'}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <EventsPageContent />
    </Suspense>
  );
}
