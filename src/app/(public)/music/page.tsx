/**
 * Artist Directory Page
 */

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ArtistsBrowseClient } from './artists-client';

export const metadata: Metadata = {
  title: 'Music | GVTEWAY',
  description: 'Discover artists and live music',
};

interface ArtistsPageProps {
  searchParams: Promise<{
    genre?: string;
    search?: string;
  }>;
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
  const supabase = await createClient();
  const { genre, search } = await searchParams;

  let query = supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (genre) {
    query = query.contains('genre_tags', [genre]);
  }

  const { data: artists, error } = await query;

  if (error) {
    console.error('Failed to fetch artists:', error);
  }

  return <ArtistsBrowseClient initialArtists={artists || []} initialSearch={search} />;
}
