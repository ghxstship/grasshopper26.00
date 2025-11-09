import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: schedule, error } = await supabase
      .from('event_schedule')
      .select(`
        *,
        artists (name),
        event_stages (name)
      `)
      .eq('event_id', id)
      .order('start_time');

    if (error) throw error;

    const formattedSchedule = schedule?.map(item => ({
      ...item,
      artist_name: item.artists?.name,
      stage_name: item.event_stages?.name,
    })) || [];

    return NextResponse.json({ schedule: formattedSchedule });
  } catch (error: any) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch schedule' },
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

    const { data: scheduleItem, error } = await supabase
      .from('event_schedule')
      .insert({
        event_id: id,
        stage_id: body.stage_id,
        artist_id: body.artist_id,
        start_time: body.start_time,
        end_time: body.end_time,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ scheduleItem });
  } catch (error: any) {
    console.error('Error creating schedule item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create schedule item' },
      { status: 500 }
    );
  }
}
