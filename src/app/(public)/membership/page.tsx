/**
 * Membership Tiers Page
 */

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MembershipBrowseClient } from './membership-client';

export const metadata: Metadata = {
  title: 'Membership Tiers | GVTEWAY',
  description: 'Join GVTEWAY and unlock exclusive benefits',
};

export default async function MembershipPage() {
  const supabase = await createClient();

  const { data: tiers, error } = await supabase
    .from('membership_tiers')
    .select('*')
    .eq('is_active', true)
    .order('tier_level', { ascending: true });

  if (error) {
    console.error('Failed to fetch membership tiers:', error);
  }

  return <MembershipBrowseClient initialTiers={tiers || []} />;
}
