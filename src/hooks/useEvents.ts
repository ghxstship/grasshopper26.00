/**
 * useEvents Hook
 * Manages events data, filtering, sorting, and search for browse pages
 * Used by: Events page with PublicBrowseTemplate
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface Event {
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

export type SortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
export type StatusFilter = 'all' | 'upcoming' | 'on-sale' | 'sold-out';

interface UseEventsOptions {
  initialSearch?: string;
  initialSort?: SortOption;
  initialStatus?: StatusFilter;
}

export function useEvents(options: UseEventsOptions = {}) {
  const supabase = createClient();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(options.initialSearch || '');
  const [sortBy, setSortBy] = useState<SortOption>(options.initialSort || 'date-asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(options.initialStatus || 'all');

  // Load events from database
  const loadEvents = useCallback(async () => {
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
  }, [supabase]);

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
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
  }, [events, searchQuery, sortBy, statusFilter]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSortBy('date-asc');
    setStatusFilter('all');
  }, []);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  return {
    // Data
    events,
    filteredEvents,
    loading,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Sort
    sortBy,
    setSortBy,
    
    // Filter
    statusFilter,
    setStatusFilter,
    
    // Actions
    clearFilters,
    reload: loadEvents,
  };
}
