/**
 * Artist Detail Page
 * Individual artist profile with events and bio
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { HalftoneOverlay } from '@/components/ui/halftone-overlay';
import { FollowArtistButton } from '@/components/features/artists/follow-artist-button';

interface ArtistPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;
  
  const { data: artist } = await supabase
    .from('artists')
    .select('name, bio')
    .eq('slug', slug)
    .single();

  if (!artist) {
    return {
      title: 'Artist Not Found | GVTEWAY',
    };
  }

  return {
    title: `${artist.name} | GVTEWAY`,
    description: artist.bio || `View ${artist.name}'s profile and upcoming events`,
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  // Fetch artist
  const { data: artist, error } = await supabase
    .from('artists')
    .select(`
      *,
      event_artists (
        events (
          id,
          title,
          slug,
          start_date,
          venue_name,
          hero_image_url
        )
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !artist) {
    notFound();
  }

  // Get user session for follow button
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user follows this artist
  let isFollowing = false;
  if (user) {
    const { data: followData } = await supabase
      .from('user_favorite_artists')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('artist_id', artist.id)
      .single();
    
    isFollowing = !!followData;
  }

  const upcomingEvents = artist.event_artists
    ?.map((ea: any) => ea.events)
    .filter((event: any) => event && new Date(event.start_date) > new Date())
    .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()) || [];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b-3 border-black">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Artist Image */}
            <div className="aspect-square relative border-3 border-black shadow-geometric">
              {artist.profile_image_url ? (
                <HalftoneOverlay preset="medium" opacity={0.3}>
                  <Image
                    src={artist.profile_image_url}
                    alt={artist.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </HalftoneOverlay>
              ) : (
                <div className="w-full h-full bg-grey-200 flex items-center justify-center">
                  <span className="font-anton text-[120px] uppercase text-grey-400">
                    {artist.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="font-anton text-hero uppercase">
                  {artist.name}
                </h1>
                {artist.verified && (
                  <div className="bg-black text-white px-4 py-2 border-3 border-black">
                    <span className="font-bebas text-h6 uppercase">
                      VERIFIED
                    </span>
                  </div>
                )}
              </div>

              {/* Genre Tags */}
              {artist.genre_tags && artist.genre_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {artist.genre_tags.map((genre: string) => (
                    <span
                      key={genre}
                      className="font-share-mono text-body px-3 py-1 border-2 border-black"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio */}
              {artist.bio && (
                <p className="font-share text-body mb-6 whitespace-pre-line">
                  {artist.bio}
                </p>
              )}

              {/* Social Links */}
              {artist.social_links && (
                <div className="flex gap-4 mb-6">
                  {Object.entries(artist.social_links as Record<string, string>).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bebas text-body uppercase underline hover:no-underline"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              )}

              {/* Follow Button */}
              {user && (
                <FollowArtistButton
                  artistId={artist.id}
                  artistName={artist.name}
                  initialFollowing={isFollowing}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-12 border-b-3 border-black">
          <div className="container mx-auto px-4">
            <h2 className="font-anton text-h1 uppercase mb-8">
              UPCOMING EVENTS
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group border-3 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-geometric"
                >
                  {event.hero_image_url && (
                    <div className="aspect-video relative border-b-3 border-black overflow-hidden">
                      <Image
                        src={event.hero_image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-share-mono text-meta mb-2">
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <h3 className="font-bebas text-h4 uppercase mb-2">
                      {event.title}
                    </h3>
                    <p className="font-share text-body text-grey-700 group-hover:text-grey-300">
                      {event.venue_name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
