/**
 * useAdminBudgets Hook
 * Manages budgets data for admin interface
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Budget {
  id: string;
  budget_name: string;
  budget_status: string;
  total_budgeted: number;
  total_actual: number;
  event_id: string;
  created_at: string;
  updated_at: string;
}

interface BudgetsStats {
  total: number;
  active: number;
  total_value: number;
}

export function useAdminBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<BudgetsStats>({
    total: 0,
    active: 0,
    total_value: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchBudgets() {
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setBudgets(data || []);
        
        // Calculate stats
        const total = data?.length || 0;
        const active = data?.filter((b: Budget) => 
          ['draft', 'pending_approval', 'approved'].includes(b.budget_status)
        ).length || 0;
        const total_value = data?.reduce((sum: number, b: Budget) => sum + (b.total_budgeted || 0), 0) || 0;

        setStats({ total, active, total_value });
      } catch (error) {
        console.error('Error fetching budgets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgets();
  }, []);

  // Filter budgets based on search query
  const filteredBudgets = budgets.filter(budget =>
    budget.budget_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    budgets: filteredBudgets,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
  };
}
