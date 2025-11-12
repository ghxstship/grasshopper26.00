/**
 * Adventures Page
 */

import { createClient } from '@/lib/supabase/server';
import { AdventuresBrowseClient } from './adventures-client';

export const dynamic = 'force-dynamic';

interface AdventuresPageProps {
  searchParams: Promise<{
    type?: string;
    search?: string;
    lat?: string;
    lng?: string;
    radius?: string;
  }>;
}

export default async function AdventuresPage({ searchParams }: AdventuresPageProps) {
  const supabase = await createClient();
  const { type, search, lat, lng, radius } = await searchParams;

  // If geolocation provided, use radius search function
  if (lat && lng) {
    const radiusMiles = radius ? parseFloat(radius) : 50;
    const { data: adventures, error } = await supabase
      .rpc('search_adventures_by_radius', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_miles: radiusMiles,
      });

    if (error) {
      console.error('Failed to fetch adventures by radius:', error);
    }

    return <AdventuresBrowseClient initialAdventures={adventures || []} initialSearch={search} />;
  }

  // Otherwise, standard query
  let query = supabase
    .from('adventures')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('name', { ascending: true });

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,location_name.ilike.%${search}%`);
  }

  if (type) {
    query = query.eq('adventure_type', type);
  }

  const { data: adventures, error } = await query;

  if (error) {
    console.error('Failed to fetch adventures:', error);
  }

  return <AdventuresBrowseClient initialAdventures={adventures || []} initialSearch={search} />;
}
