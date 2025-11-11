'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminBrands() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, total_value: 0 });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const { data } = await supabase.from('brands').select('*').order('name');
      setBrands(data || []);
      setStats({ total: data?.length || 0, active: data?.filter((b: any) => b.status === 'active').length || 0, total_value: 0 });
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  return { brands, stats, loading, searchQuery, setSearchQuery, reload: loadBrands };
}
