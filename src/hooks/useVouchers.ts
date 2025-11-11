'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useVouchers() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, used: 0, expired: 0 });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase.from('user_vouchers').select('*').eq('user_id', user.id);
      const voucherList = data || [];
      const now = new Date();

      setVouchers(voucherList);
      setStats({
        active: voucherList.filter((v: any) => !v.used && (!v.expires_at || new Date(v.expires_at) > now)).length,
        used: voucherList.filter((v: any) => v.used).length,
        expired: voucherList.filter((v: any) => v.expires_at && new Date(v.expires_at) < now && !v.used).length,
      });
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  return { vouchers, stats, loading, reload: loadVouchers };
}
