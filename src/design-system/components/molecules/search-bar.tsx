'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Calendar, Music, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './search-bar.module.css';

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
    <div ref={searchRef} className={styles.container}>
      <div className={styles.inputWrapper}>
        <Search className={styles.searchIcon} />
        <Input
          type="text"
          placeholder="Search events, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />
        {loading && (
          <Loader2 className={styles.loader} />
        )}
      </div>

      {showResults && results && (query.length >= 2) && (
        <Card className={styles.resultsCard}>
          <div className={styles.resultsContent}>
            {/* Events */}
            {results.events && results.events.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Calendar className={styles.sectionIcon} />
                  Events
                </div>
                {results.events.map((event: any) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    onClick={() => setShowResults(false)}
                    className={styles.resultItem}
                  >
                    {event.hero_image_url && (
                      <div className={styles.resultImage}>
                        <Image
                          src={event.hero_image_url}
                          alt={event.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className={styles.resultContent}>
                      <p className={styles.resultTitle}>{event.name}</p>
                      <p className={styles.resultMeta}>
                        {new Date(event.start_date).toLocaleDateString()} • {event.venue_name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Artists */}
            {results.artists && results.artists.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Music className={styles.sectionIcon} />
                  Artists
                </div>
                {results.artists.map((artist: any) => (
                  <Link
                    key={artist.id}
                    href={`/artists/${artist.slug}`}
                    onClick={() => setShowResults(false)}
                    className={styles.resultItem}
                  >
                    {artist.profile_image_url && (
                      <div className={`${styles.resultImage} ${styles.resultImageRound}`}>
                        <Image
                          src={artist.profile_image_url}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className={styles.resultContent}>
                      <p className={styles.resultTitle}>{artist.name}</p>
                      {artist.genre_tags && artist.genre_tags.length > 0 && (
                        <p className={styles.resultMeta}>
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
              <div className={styles.noResults}>
                No results found for &quot;{query}&quot;
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
