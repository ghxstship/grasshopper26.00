'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Calendar, Music, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search events, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-black/50 border-purple-500/30 focus:border-purple-500/50"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 animate-spin" />
        )}
      </div>

      {showResults && results && (query.length >= 2) && (
        <Card className="absolute top-full mt-2 w-full bg-black/95 backdrop-blur-lg border-purple-500/20 max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            {/* Events */}
            {results.events && results.events.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Events
                </div>
                {results.events.map((event: any) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center gap-3 p-2 rounded hover:bg-purple-500/10 transition-colors"
                  >
                    {event.hero_image_url && (
                      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={event.hero_image_url}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{event.name}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {new Date(event.start_date).toLocaleDateString()} • {event.venue_name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Artists */}
            {results.artists && results.artists.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-gray-400">
                  <Music className="h-4 w-4" />
                  Artists
                </div>
                {results.artists.map((artist: any) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.slug}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center gap-3 p-2 rounded hover:bg-purple-500/10 transition-colors"
                  >
                    {artist.profile_image_url && (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={artist.profile_image_url}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{artist.name}</p>
                      {artist.genre_tags && artist.genre_tags.length > 0 && (
                        <p className="text-sm text-gray-400 truncate">
                          {artist.genre_tags.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No results */}
            {results.events?.length === 0 && results.artists?.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                No results found for &quot;{query}&quot;
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
