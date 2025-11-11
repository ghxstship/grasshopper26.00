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

  const { data: companionPasses } = await supabase
    .from('membership_companion_passes')
    .select('*')
    .eq('is_active', true);

  // Attach companion passes to their respective tiers
  const tiersWithCompanionPasses = (tiers || []).map(tier => {
    const companionPass = companionPasses?.find(cp => cp.tier_id === tier.id);
    return {
      ...tier,
      companion_pass: companionPass ? {
        id: companionPass.id,
        monthly_price: companionPass.monthly_price,
        annual_price: companionPass.annual_price,
        max_companions: companionPass.max_companions,
      } : undefined,
    };
  });

  return <MembershipBrowseClient initialTiers={tiersWithCompanionPasses} companionPasses={companionPasses || []} />;
}
