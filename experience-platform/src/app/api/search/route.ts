import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'events', 'artists', 'all'

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const results: any = {
      events: [],
      artists: [],
    };

    // Search events
    if (!type || type === 'events' || type === 'all') {
      const { data: events } = await supabase
        .from('events')
        .select('id, name, slug, start_date, venue_name, hero_image_url')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,venue_name.ilike.%${query}%`)
        .limit(10);

      results.events = events || [];
    }

    // Search artists
    if (!type || type === 'artists' || type === 'all') {
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name, slug, profile_image_url, genre_tags')
        .or(`name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(10);

      results.artists = artists || [];
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
