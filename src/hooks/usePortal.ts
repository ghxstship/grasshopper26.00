/**
 * usePortal Hook
 * Manages portal dashboard data for authenticated users
 * Used by: Portal page with PortalDashboardTemplate
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Membership {
  id: string;
  user_id: string;
  tier_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  credits_remaining: number;
  membership_tiers: {
    id: string;
    display_name: string;
    tier_level: number;
  };
}

interface UserProfile {
  id: string;
  display_name: string | null;
  email: string;
}

interface Ticket {
  id: string;
  status: string;
  events: {
    id: string;
    name: string;
    start_date: string;
    venue_name: string;
  };
}

interface MemberEvent {
  id: string;
  events: {
    id: string;
    name: string;
    slug: string;
    start_date: string;
    hero_image_url: string;
  };
}

export function usePortal() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [upcomingTickets, setUpcomingTickets] = useState<Ticket[]>([]);
  const [memberEvents, setMemberEvents] = useState<MemberEvent[]>([]);
  const [recentBenefits, setRecentBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortalData = useCallback(async () => {
    try {
      // Get authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login?redirect=/portal');
        return;
      }

      setUser(authUser);

      // Load user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setProfile(profileData);

      // Load active membership
      const { data: membershipData } = await supabase
        .from('user_memberships')
        .select('*, membership_tiers(*)')
        .eq('user_id', authUser.id)
        .eq('status', 'active')
        .single();

      setMembership(membershipData);

      // Load upcoming tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*, events(*)')
        .eq('user_id', authUser.id)
        .gte('events.start_date', new Date().toISOString())
        .order('events.start_date', { ascending: true })
        .limit(5);

      setUpcomingTickets(ticketsData || []);

      // Load recent benefit usage
      if (membershipData) {
        const { data: benefitsData } = await supabase
          .from('membership_benefit_usage')
          .select('*')
          .eq('membership_id', membershipData.id)
          .order('used_at', { ascending: false })
          .limit(10);

        setRecentBenefits(benefitsData || []);
      }

      // Load member-only events
      if (membershipData) {
        const { data: eventsData } = await supabase
          .from('member_events')
          .select('*, events(*)')
          .gte('events.start_date', new Date().toISOString())
          .lte('min_tier_level', membershipData.membership_tiers?.tier_level || 0)
          .order('events.start_date', { ascending: true })
          .limit(4);

        setMemberEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error loading portal data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Calculate stats
  const stats = {
    credits: membership?.credits_remaining || 0,
    benefitsUsed: recentBenefits.length,
    upcomingEvents: upcomingTickets.length,
    memberSince: membership?.start_date ? new Date(membership.start_date).getFullYear() : null,
  };

  return {
    // User data
    user,
    profile,
    membership,
    
    // Content data
    upcomingTickets,
    memberEvents,
    recentBenefits,
    
    // Stats
    stats,
    
    // State
    loading,
    
    // Actions
    reload: loadPortalData,
  };
}
