'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminBrandDetail(id: string) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<any>(null);

  useEffect(() => {
    if (id) loadBrand();
  }, [id]);

  const loadBrand = async () => {
    try {
      const { data } = await supabase.from('brands').select('*').eq('id', id).single();
      setBrand(data);
    } finally { setLoading(false); }
  };

  return { brand, loading };
}
