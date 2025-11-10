'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminAdvanceDetail(id: string) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [advance, setAdvance] = useState<any>(null);

  useEffect(() => {
    if (id) loadAdvance();
  }, [id]);

  const loadAdvance = async () => {
    try {
      const { data } = await supabase.from('advances').select('*').eq('id', id).single();
      setAdvance(data);
    } finally { setLoading(false); }
  };

  return { advance, loading };
}
