'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useReferrals() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, rewards: 0 });

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase.from('referrals').select('*').eq('referrer_id', user.id);
      const referralList = data || [];

      setReferrals(referralList);
      setStats({
        total: referralList.length,
        active: referralList.filter(r => r.status === 'active').length,
        rewards: referralList.reduce((sum, r) => sum + (r.reward_amount || 0), 0),
      });
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  return { referrals, stats, loading, reload: loadReferrals };
}
