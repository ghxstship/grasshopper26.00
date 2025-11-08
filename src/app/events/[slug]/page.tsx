import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { TicketSelector } from '@/components/features/ticket-selector';

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createServerClient();
  const { slug } = await params;

  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      event_artists (
        artist_id,
        headliner,
        artists (
          id,
          name,
          slug,
          profile_image_url,
          genre_tags
        )
      ),
      event_stages (*),
      ticket_types (*)
    `)
    .eq('slug', slug)
    .single();

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {event.hero_image_url ? (
          <Image
            src={event.hero_image_url}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {startDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                  {endDate && ` - ${endDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.venue_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{event.age_restriction || '18+'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-white">About This Event</h2>
                <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
              </CardContent>
            </Card>

            {/* Lineup */}
            {event.event_artists && event.event_artists.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-white">Lineup</h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {event.event_artists.map((ea: any) => (
                      <Link
                        key={ea.artist_id}
                        href={`/artists/${ea.artists.slug}`}
                        className="group"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                          {ea.artists.profile_image_url ? (
                            <Image
                              src={ea.artists.profile_image_url}
                              alt={ea.artists.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600" />
                          )}
                          {ea.headliner && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                              HEADLINER
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                          {ea.artists.name}
                        </h3>
                        {ea.artists.genre_tags && ea.artists.genre_tags.length > 0 && (
                          <p className="text-sm text-gray-400">
                            {ea.artists.genre_tags.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stages */}
            {event.event_stages && event.event_stages.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-white">Stages</h2>
                  <div className="grid gap-4">
                    {event.event_stages.map((stage: any) => (
                      <div
                        key={stage.id}
                        className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20"
                      >
                        <h3 className="font-bold text-lg text-white">{stage.name}</h3>
                        {stage.description && (
                          <p className="text-gray-400 mt-1">{stage.description}</p>
                        )}
                        {stage.capacity && (
                          <p className="text-sm text-gray-500 mt-2">
                            Capacity: {stage.capacity.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <TicketSelector
                ticketTypes={event.ticket_types || []}
                eventId={event.id}
                eventName={event.name}
                eventSlug={event.slug}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
