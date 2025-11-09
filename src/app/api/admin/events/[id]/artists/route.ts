import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: artists, error } = await supabase
      .from('event_artists')
      .select(`
        id,
        artist_id,
        billing_order,
        is_headliner,
        artists (
          id,
          name,
          slug,
          bio,
          genre_tags,
          profile_image_url,
          verified
        )
      `)
      .eq('event_id', id)
      .order('billing_order');

    if (error) throw error;

    // Flatten the structure
    const formattedArtists = artists?.map(ea => ({
      event_artist_id: ea.id,
      billing_order: ea.billing_order,
      is_headliner: ea.is_headliner,
      ...ea.artists,
    })) || [];

    return NextResponse.json({ artists: formattedArtists });
  } catch (error: any) {
    console.error('Error fetching event artists:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event artists' },
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

    const { data: eventArtist, error } = await supabase
      .from('event_artists')
      .insert({
        event_id: id,
        artist_id: body.artist_id,
        billing_order: body.billing_order,
        is_headliner: body.is_headliner || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ eventArtist });
  } catch (error: any) {
    console.error('Error assigning artist:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign artist' },
      { status: 500 }
    );
  }
}
