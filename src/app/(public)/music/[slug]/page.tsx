import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ArtistDetailClient } from './artist-detail-client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: artist } = await supabase.from('artists').select('name, bio').eq('slug', slug).single();
  
  return {
    title: artist ? `${artist.name} | GVTEWAY` : 'Artist | GVTEWAY',
    description: artist?.bio || 'Artist profile',
  };
}

export default async function ArtistDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: artist } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!artist) notFound();

  return <ArtistDetailClient artist={artist} />;
}
