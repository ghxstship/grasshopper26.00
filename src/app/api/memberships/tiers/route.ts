import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all active membership tiers
    const { data: tiers, error } = await supabase
      .from('membership_tiers')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ tiers: tiers || [] });
  } catch (error: any) {
    console.error('Get tiers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get membership tiers' },
      { status: 500 }
    );
  }
}
