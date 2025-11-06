import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Music, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function ArtistsPage() {
  const supabase = await createClient()

  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true })
    .limit(50)

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
            Featured Artists
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the talent behind unforgettable performances
          </p>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {!artists || artists.length === 0 ? (
            <div className="text-center py-20">
              <Music className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No artists available yet</p>
              <p className="text-gray-500 mt-2">Check back soon for lineup announcements!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {artists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  className="group"
                >
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all hover:scale-105">
                    <div className="aspect-square bg-gradient-to-br from-purple-900 to-pink-900 relative overflow-hidden">
                      {artist.profile_image_url ? (
                        <img
                          src={artist.profile_image_url}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-20 w-20 text-white/20" />
                        </div>
                      )}
                      {artist.verified && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                        {artist.name}
                      </h3>
                      {artist.genre_tags && artist.genre_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {artist.genre_tags.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                        <ExternalLink className="ml-2 h-3 w-3" />
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
