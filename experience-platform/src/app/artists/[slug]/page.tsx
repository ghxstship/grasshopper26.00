import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Music, ExternalLink, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function ArtistDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createServerClient();
  const { slug } = await params;

  const { data: artist } = await supabase
    .from('artists')
    .select(`
      *,
      event_artists (
        event_id,
        headliner,
        events (
          id,
          name,
          slug,
          start_date,
          venue_name,
          hero_image_url,
          status
        )
      )
    `)
    .eq('slug', slug)
    .single();

  if (!artist) {
    notFound();
  }

  const upcomingEvents = artist.event_artists
    ?.filter((ea: any) => new Date(ea.events.start_date) > new Date())
    .sort((a: any, b: any) => 
      new Date(a.events.start_date).getTime() - new Date(b.events.start_date).getTime()
    ) || [];

  const pastEvents = artist.event_artists
    ?.filter((ea: any) => new Date(ea.events.start_date) <= new Date())
    .sort((a: any, b: any) => 
      new Date(b.events.start_date).getTime() - new Date(a.events.start_date).getTime()
    ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        {artist.cover_image_url ? (
          <Image
            src={artist.cover_image_url}
            alt={artist.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto flex items-end gap-6">
            {artist.profile_image_url && (
              <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border-4 border-purple-500/50 flex-shrink-0">
                <Image
                  src={artist.profile_image_url}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {artist.name}
              </h1>
              {artist.genre_tags && artist.genre_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artist.genre_tags.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-purple-600/30 backdrop-blur-sm rounded-full text-sm text-purple-200"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Heart className="mr-2 h-4 w-4" />
              Follow
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-white">About</h2>
                <p className="text-gray-300 whitespace-pre-line">
                  {artist.bio || 'No biography available.'}
                </p>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    Upcoming Events
                  </h2>
                  <div className="space-y-4">
                    {upcomingEvents.map((ea: any) => (
                      <Link
                        key={ea.event_id}
                        href={`/events/${ea.events.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-4 p-4 rounded-lg bg-purple-900/20 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                          {ea.events.hero_image_url && (
                            <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={ea.events.hero_image_url}
                                alt={ea.events.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                              {ea.events.name}
                              {ea.headliner && (
                                <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                                  HEADLINER
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {new Date(ea.events.start_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-gray-400">{ea.events.venue_name}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-white">Past Performances</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {pastEvents.slice(0, 6).map((ea: any) => (
                      <Link
                        key={ea.event_id}
                        href={`/events/${ea.events.slug}`}
                        className="group"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                          {ea.events.hero_image_url ? (
                            <Image
                              src={ea.events.hero_image_url}
                              alt={ea.events.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600" />
                          )}
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors text-sm">
                          {ea.events.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {new Date(ea.events.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Social Links */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Connect
                  </h2>
                  
                  {artist.social_links && Object.keys(artist.social_links).length > 0 ? (
                    <div className="space-y-3">
                      {artist.social_links.spotify && (
                        <a
                          href={artist.social_links.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-green-600/20 border border-green-500/20 hover:border-green-500/40 transition-all group"
                        >
                          <Music className="h-5 w-5 text-green-400" />
                          <span className="flex-1 text-white group-hover:text-green-400">Spotify</span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      )}
                      {artist.social_links.instagram && (
                        <a
                          href={artist.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-pink-600/20 border border-pink-500/20 hover:border-pink-500/40 transition-all group"
                        >
                          <svg className="h-5 w-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span className="flex-1 text-white group-hover:text-pink-400">Instagram</span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      )}
                      {artist.social_links.soundcloud && (
                        <a
                          href={artist.social_links.soundcloud}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-orange-600/20 border border-orange-500/20 hover:border-orange-500/40 transition-all group"
                        >
                          <Music className="h-5 w-5 text-orange-400" />
                          <span className="flex-1 text-white group-hover:text-orange-400">SoundCloud</span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      )}
                      {artist.website_url && (
                        <a
                          href={artist.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
                        >
                          <ExternalLink className="h-5 w-5 text-purple-400" />
                          <span className="flex-1 text-white group-hover:text-purple-400">Official Website</span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No social links available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
