import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's membership
    const { data: membership } = await supabase
      .from('user_memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ passes: [] });
    }

    // Get companion passes for this membership
    const { data: passes, error } = await supabase
      .from('user_companion_passes')
      .select(`
        *,
        companion_pass:membership_companion_passes(*)
      `)
      .eq('user_membership_id', membership.id)
      .eq('status', 'active');

    if (error) throw error;

    return NextResponse.json({ passes: passes || [] });
  } catch (error: any) {
    console.error('Get user companion passes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get companion passes' },
      { status: 500 }
    );
  }
}
