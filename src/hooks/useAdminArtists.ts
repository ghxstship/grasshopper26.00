'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminArtists() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, upcoming_shows: 0 });

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      const { data } = await supabase.from('artists').select('*').order('name');
      setArtists(data || []);
      setStats({ total: data?.length || 0, active: data?.filter(a => a.status === 'active').length || 0, upcoming_shows: 0 });
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  };

  return { artists, stats, loading, searchQuery, setSearchQuery, reload: loadArtists };
}
