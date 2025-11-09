import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: stages, error } = await supabase
      .from('event_stages')
      .select('*')
      .eq('event_id', id)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ stages: stages || [] });
  } catch (error: any) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { data: stage, error } = await supabase
      .from('event_stages')
      .insert({
        event_id: id,
        name: body.name,
        capacity: body.capacity,
        location: body.location,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ stage });
  } catch (error: any) {
    console.error('Error creating stage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create stage' },
      { status: 500 }
    );
  }
}
