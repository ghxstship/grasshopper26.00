'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAdminDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_users: 0, active_members: 0, tickets_sold: 0, revenue: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, members, tickets, orders] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_memberships').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('tickets').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
      ]);

      setStats({
        total_users: users.count || 0,
        active_members: members.count || 0,
        tickets_sold: tickets.count || 0,
        revenue: orders.data?.reduce((sum: number, o: any) => sum + parseFloat(o.total_amount), 0) || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, reload: loadStats };
}
