'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Credential {
  id: string;
  event_id: string;
  user_id: string;
  credential_type: string;
  status: string;
  created_at: string;
}

export function useAdminCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCredentials();
  }, []);

  async function loadCredentials() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('event_credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading credentials:', error);
      } else {
        setCredentials(data || []);
        setStats({
          total: data?.length || 0,
          active: data?.filter((c: Credential) => c.status === 'active').length || 0,
          pending: data?.filter((c: Credential) => c.status === 'pending').length || 0,
        });
      }
    } catch (error) {
      console.error('Error in loadCredentials:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCredentials = credentials.filter(credential =>
    credential.credential_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    credentials: filteredCredentials,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    refresh: loadCredentials,
  };
}
