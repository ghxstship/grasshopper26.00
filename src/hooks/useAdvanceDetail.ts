'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useAdvanceDetail(id: string) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [advance, setAdvance] = useState<any>(null);

  useEffect(() => {
    if (id) loadAdvance();
  }, [id]);

  const loadAdvance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('advances').select('*').eq('id', id).eq('user_id', user.id).single();
      setAdvance(data);
    } finally { setLoading(false); }
  };

  return { advance, loading };
}
