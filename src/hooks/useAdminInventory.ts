'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminInventory() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, in_stock: 0, low_stock: 0 });

  useEffect(() => { loadInventory(); }, []);

  const loadInventory = async () => {
    try {
      const { data } = await supabase.from('products').select('*');
      setInventory(data || []);
      setStats({ total: data?.length || 0, in_stock: data?.filter((p: any) => p.stock > 0).length || 0, low_stock: data?.filter((p: any) => p.stock < 10 && p.stock > 0).length || 0 });
    } finally { setLoading(false); }
  };

  return { inventory, stats, loading, searchQuery, setSearchQuery, reload: loadInventory };
}
