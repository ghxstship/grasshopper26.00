/**
 * useOrders Hook
 * Manages order history data
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: string;
  tickets?: Array<{
    id: string;
    status: string;
    ticket_type?: Array<{
      name: string;
      event?: Array<{
        name: string;
        start_date: string;
        venue_name: string;
      }>;
    }>;
  }>;
}

export function useOrders() {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/orders');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          tickets (
            id,
            status,
            ticket_type:ticket_types (
              name,
              event:events (
                name,
                start_date,
                venue_name
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders((data as any) || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    reload: loadOrders,
  };
}
