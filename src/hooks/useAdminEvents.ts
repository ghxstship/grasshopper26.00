'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminEvents() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, on_sale: 0 });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data } = await supabase.from('events').select('*').order('start_date', { ascending: false });
      const eventList = data || [];
      const now = new Date();

      setEvents(eventList);
      setStats({
        total: eventList.length,
        upcoming: eventList.filter(e => new Date(e.start_date) > now).length,
        past: eventList.filter(e => new Date(e.start_date) < now).length,
        on_sale: eventList.filter(e => e.status === 'on_sale').length,
      });
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  return { events, stats, loading, searchQuery, setSearchQuery, statusFilter, setStatusFilter, reload: loadEvents };
}
