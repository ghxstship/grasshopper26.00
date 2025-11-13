'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Ticket {
  id: string;
  order_id: string;
  user_id: string;
  status: string;
  qr_code: string;
  checked_in_at: string | null;
  created_at: string;
}

export function useAdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    checkedIn: 0,
    scanned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading tickets:', error);
      } else {
        setTickets(data || []);
        setStats({
          total: data?.length || 0,
          active: data?.filter((t: Ticket) => t.status === 'active').length || 0,
          checkedIn: data?.filter((t: Ticket) => t.checked_in_at !== null).length || 0,
          scanned: data?.filter((t: Ticket) => t.checked_in_at !== null).length || 0,
        });
      }
    } catch (error) {
      console.error('Error in loadTickets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.qr_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    tickets: filteredTickets,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    refresh: loadTickets,
  };
}
