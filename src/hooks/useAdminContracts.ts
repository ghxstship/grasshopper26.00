/**
 * useAdminContracts Hook
 * Manages contracts data for admin interface
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Contract {
  id: string;
  contract_name: string;
  contract_status: string;
  contract_value: number;
  vendor_id: string;
  event_id: string;
  created_at: string;
  updated_at: string;
}

interface ContractsStats {
  total: number;
  active: number;
  pending: number;
}

export function useAdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractsStats>({
    total: 0,
    active: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchContracts() {
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setContracts(data || []);
        
        // Calculate stats
        const total = data?.length || 0;
        const active = data?.filter((c: Contract) => 
          c.contract_status === 'active'
        ).length || 0;
        const pending = data?.filter((c: Contract) => 
          c.contract_status === 'pending_signature'
        ).length || 0;

        setStats({ total, active, pending });
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContracts();
  }, []);

  // Filter contracts based on search query
  const filteredContracts = contracts.filter(contract =>
    contract.contract_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    contracts: filteredContracts,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
  };
}
