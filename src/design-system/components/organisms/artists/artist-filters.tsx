/**
 * Artist Filters Component
 * Search and filter artists
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SearchIcon } from '@/design-system/components/atoms/icons/geometric-icons';

const GENRES = [
  'Electronic',
  'House',
  'Techno',
  'Trance',
  'Dubstep',
  'Drum & Bass',
  'Hip Hop',
  'Rock',
  'Pop',
  'Indie',
];

export function ArtistFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const currentGenre = searchParams.get('genre');

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    
    startTransition(() => {
      router.push(`/artists?${params.toString()}`);
    });
  };

  const handleGenreFilter = (genre: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (currentGenre === genre) {
      params.delete('genre');
    } else {
      params.set('genre', genre);
    }
    
    startTransition(() => {
      router.push(`/artists?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push('/artists');
    });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="SEARCH ARTISTS..."
          className="w-full pl-12 pr-4 py-3 border-3 border-black font-bebas text-h6 uppercase placeholder:text-grey-400 focus:outline-none focus:bg-grey-100"
        />
      </div>

      {/* Genre Filters */}
      <div>
        <p className="font-bebas text-h6 uppercase mb-3">FILTER BY GENRE:</p>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreFilter(genre)}
              className={`
                px-4 py-2 border-3 border-black font-bebas text-body uppercase
                transition-colors
                ${currentGenre === genre
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-grey-100'
                }
              `}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(search || currentGenre) && (
        <button
          onClick={clearFilters}
          className="font-bebas text-body uppercase underline hover:no-underline"
        >
          CLEAR ALL FILTERS
        </button>
      )}

      {/* Loading State */}
      {isPending && (
        <div className="text-center py-4">
          <p className="font-share text-body text-grey-600">
            Updating results...
          </p>
        </div>
      )}
    </div>
  );
}
