import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: companions, error } = await supabase
      .from('companion_profiles')
      .select('*')
      .eq('user_companion_pass_id', id)
      .eq('primary_member_id', user.id);

    if (error) throw error;

    return NextResponse.json({ companions: companions || [] });
  } catch (error: any) {
    console.error('Get companions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get companions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companion_email, companion_name, companion_phone, relationship } = body;

    // Create companion profile
    const { data: companion, error } = await supabase
      .from('companion_profiles')
      .insert({
        user_companion_pass_id: id,
        primary_member_id: user.id,
        companion_email,
        companion_name,
        companion_phone,
        relationship,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Update companions_registered count
    await supabase.rpc('increment_companions_registered', { pass_id: id });

    return NextResponse.json({ companion });
  } catch (error: any) {
    console.error('Add companion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add companion' },
      { status: 500 }
    );
  }
}
