/**
 * Artist Directory Page
 * Browse all artists with filtering and search
 */

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ArtistGrid } from '@/components/features/artists/artist-grid';
import { ArtistFilters } from '@/components/features/artists/artist-filters';

export const metadata: Metadata = {
  title: 'Artists | GVTEWAY',
  description: 'Discover artists performing at GVTEWAY events',
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

  // Build query
  let query = supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true });

  // Apply filters
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

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b-3 border-black py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-hero uppercase mb-4">
            ARTISTS
          </h1>
          <p className="font-share text-body max-w-2xl">
            Discover the incredible talent performing at GVTEWAY events. 
            From emerging artists to legendary performers.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b-3 border-black py-8">
        <div className="container mx-auto px-4">
          <ArtistFilters />
        </div>
      </section>

      {/* Artist Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {artists && artists.length > 0 ? (
            <ArtistGrid artists={artists} />
          ) : (
            <div className="text-center py-20">
              <p className="font-bebas text-h3 uppercase mb-4">
                NO ARTISTS FOUND
              </p>
              <p className="font-share text-body text-grey-600">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
