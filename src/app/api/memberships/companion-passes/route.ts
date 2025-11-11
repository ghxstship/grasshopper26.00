import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const tierId = searchParams.get('tier_id');

    let query = supabase
      .from('membership_companion_passes')
      .select('*')
      .eq('is_active', true);

    if (tierId) {
      query = query.eq('tier_id', tierId);
    }

    const { data: passes, error } = await query;

    if (error) throw error;

    return NextResponse.json({ passes: passes || [] });
  } catch (error: any) {
    console.error('Get companion passes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get companion passes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { membershipId, companionPassId, billingCycle } = body;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get companion pass details
    const { data: companionPass, error: passError } = await supabase
      .from('membership_companion_passes')
      .select('*')
      .eq('id', companionPassId)
      .single();

    if (passError || !companionPass) {
      return NextResponse.json({ error: 'Companion pass not found' }, { status: 404 });
    }

    // Create user companion pass subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_companion_passes')
      .insert({
        user_membership_id: membershipId,
        companion_pass_id: companionPassId,
        billing_cycle: billingCycle,
        max_companions: companionPass.max_companions,
        status: 'active',
      })
      .select()
      .single();

    if (subError) throw subError;

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Create companion pass subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create companion pass subscription' },
      { status: 500 }
    );
  }
}
