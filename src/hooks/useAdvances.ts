/**
 * useAdvances Hook
 * Manages production advances data fetching and state
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Advance {
  id: string;
  user_id: string;
  amount: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';
  requested_at: string;
  approved_at?: string;
  fulfilled_at?: string;
  notes?: string;
  items?: any[];
  created_at: string;
  updated_at: string;
}

export function useAdvances(filter: string = 'all') {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvances();
  }, [filter]);

  async function fetchAdvances() {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      let query = supabase
        .from('production_advances')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setAdvances(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    advances,
    loading,
    error,
    refetch: fetchAdvances,
  };
}
