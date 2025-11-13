'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Campaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export function useAdminMarketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    impressions: 0,
    conversions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const supabase = createClient();
      
      // For now, return empty data - this would connect to a marketing campaigns table
      setCampaigns([]);
      setStats({
        total: 0,
        active: 0,
        impressions: 0,
        conversions: 0,
      });
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    campaigns: filteredCampaigns,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    refresh: loadCampaigns,
  };
}
