import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active membership with tier details
    const { data: membership, error } = await supabase
      .from('user_memberships')
      .select(`
        *,
        membership_tiers (
          id,
          name,
          slug,
          price_monthly,
          price_annual,
          description,
          features,
          benefits,
          ticket_credits_monthly,
          priority_access,
          exclusive_events,
          vip_vouchers_annual,
          discount_percentage
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // If no active membership, return null
    if (!membership) {
      return NextResponse.json({ membership: null });
    }

    // Get credit balance
    const { data: credits } = await supabase
      .from('membership_ticket_credits')
      .select('remaining_credits')
      .eq('user_membership_id', membership.id)
      .single();

    // Get available VIP vouchers
    const { data: vouchers } = await supabase
      .from('membership_vip_vouchers')
      .select('*')
      .eq('user_membership_id', membership.id)
      .eq('status', 'available');

    // Get benefit usage stats
    const { data: benefitUsage } = await supabase
      .from('membership_benefit_usage')
      .select('benefit_type, usage_count')
      .eq('user_membership_id', membership.id);

    return NextResponse.json({
      membership: {
        ...membership,
        credits: credits?.remaining_credits || 0,
        vouchers: vouchers || [],
        benefitUsage: benefitUsage || [],
      },
    });
  } catch (error: any) {
    console.error('Get membership error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get membership' },
      { status: 500 }
    );
  }
}
