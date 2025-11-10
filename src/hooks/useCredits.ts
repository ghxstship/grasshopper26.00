'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useCredits() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_credits: 0, available_credits: 0, expiring_soon: 0, expired_credits: 0 });

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase.from('user_credits').select('*').eq('user_id', user.id);
      const creditList = data || [];
      const now = new Date();

      setCredits(creditList);
      setStats({
        total_credits: creditList.reduce((sum, c) => sum + c.amount, 0),
        available_credits: creditList.filter(c => !c.used && (!c.expires_at || new Date(c.expires_at) > now)).reduce((sum, c) => sum + c.amount, 0),
        expiring_soon: creditList.filter(c => !c.used && c.expires_at && new Date(c.expires_at) > now && new Date(c.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
        expired_credits: creditList.filter(c => c.expires_at && new Date(c.expires_at) < now).reduce((sum, c) => sum + c.amount, 0),
      });
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setLoading(false);
    }
  };

  return { credits, stats, loading, reload: loadCredits };
}
