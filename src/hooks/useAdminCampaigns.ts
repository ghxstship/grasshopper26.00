/**
 * useAdminCampaigns Hook
 * Manages marketing campaigns data for admin interface
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  campaign_status: string;
  budgeted_amount: number;
  actual_spend: number;
  target_reach: number;
  actual_reach: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface CampaignsStats {
  total: number;
  active: number;
  total_reach: number;
}

export function useAdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignsStats>({
    total: 0,
    active: 0,
    total_reach: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchCampaigns() {
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) throw error;

        setCampaigns(data || []);
        
        // Calculate stats
        const total = data?.length || 0;
        const active = data?.filter((c: Campaign) => 
          ['planning', 'scheduled', 'active'].includes(c.campaign_status)
        ).length || 0;
        const total_reach = data?.reduce((sum: number, c: Campaign) => sum + (c.actual_reach || 0), 0) || 0;

        setStats({ total, active, total_reach });
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  // Filter campaigns based on search query
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.campaign_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.campaign_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    campaigns: filteredCampaigns,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
  };
}
