'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface MembershipTier {
  id: string;
  tier_name: string;
  display_name: string;
  tier_level: number;
  annual_price: number;
  monthly_price: number | null;
  benefits: any;
  limits: any;
  badge_icon: string | null;
  badge_color: string | null;
}

interface UserMembership {
  id: string;
  tier_id: string;
  status: string;
  billing_cycle: string;
  start_date: string;
  renewal_date: string | null;
  ticket_credits_remaining: number;
  ticket_credits_total: number;
  vip_upgrades_remaining: number;
  tier: MembershipTier;
}

export function useMembershipTiers() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [currentMembership, setCurrentMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembershipData();
  }, []);

  async function loadMembershipData() {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        setError('Authentication error');
        setLoading(false);
        return;
      }

      // Load all tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('membership_tiers')
        .select('*')
        .eq('is_active', true)
        .order('tier_level', { ascending: true });

      if (tiersError) {
        console.error('Error loading tiers:', tiersError);
        setError('Failed to load membership tiers');
      } else {
        setTiers(tiersData || []);
      }

      // Load user's current membership
      if (user) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('user_memberships')
          .select(`
            *,
            tier:membership_tiers(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (membershipError) {
          console.error('Error loading membership:', membershipError);
        } else {
          setCurrentMembership(membershipData);
        }
      }
    } catch (err) {
      console.error('Error in loadMembershipData:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return { tiers, currentMembership, loading, error, refresh: loadMembershipData };
}
