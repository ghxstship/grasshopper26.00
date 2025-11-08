import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .in('status', ['upcoming', 'on_sale'])
    .order('start_date', { ascending: true })
    .limit(20)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900/20">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Grasshopper
          </Link>
          <nav className="flex gap-6">
            <Link href="/events" className="hover:text-purple-400 transition-colors">Events</Link>
            <Link href="/artists" className="hover:text-purple-400 transition-colors">Artists</Link>
            <Link href="/shop" className="hover:text-purple-400 transition-colors">Shop</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the best festivals, concerts, and live experiences
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {!events || events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No upcoming events at the moment</p>
              <p className="text-gray-500 mt-2">Check back soon for new announcements!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group"
                >
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all hover:scale-105">
                    {event.hero_image_url && (
                      <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900 relative overflow-hidden">
                        <Image
                          src={event.hero_image_url}
                          alt={event.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {event.status === 'sold_out' && (
                          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            SOLD OUT
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                        {event.name}
                      </h3>
                      <div className="space-y-2 text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(event.start_date), 'MMMM d, yyyy')}</span>
                        </div>
                        {event.venue_name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.venue_name}</span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full mt-4" variant={event.status === 'sold_out' ? 'outline' : 'default'}>
                        {event.status === 'sold_out' ? 'Join Waitlist' : 'Get Tickets'}
                        <Ticket className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
