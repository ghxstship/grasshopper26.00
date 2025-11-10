'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminBulkOps() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, in_progress: 0 });

  useEffect(() => { loadOperations(); }, []);

  const loadOperations = async () => {
    try {
      const { data } = await supabase.from('bulk_operations').select('*');
      setOperations(data || []);
      setStats({ total: data?.length || 0, completed: data?.filter(o => o.status === 'completed').length || 0, in_progress: data?.filter(o => o.status === 'in_progress').length || 0 });
    } finally { setLoading(false); }
  };

  return { operations, stats, loading, reload: loadOperations };
}
