'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdvancesCatalog() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [advances, setAdvances] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('amount-asc');

  useEffect(() => { loadAdvances(); }, []);

  const loadAdvances = async () => {
    try {
      const { data } = await supabase.from('advance_catalog').select('*');
      setAdvances(data || []);
    } finally { setLoading(false); }
  };

  return { advances, loading, searchQuery, setSearchQuery, sortBy, setSortBy };
}
