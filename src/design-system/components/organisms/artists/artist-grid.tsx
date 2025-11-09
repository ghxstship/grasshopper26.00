/**
 * Artist Grid Component
 * Displays artists in a responsive grid
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HalftoneOverlay } from '@/design-system/components/atoms/halftone-overlay';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  profile_image_url?: string;
  genre_tags?: string[];
  verified?: boolean;
}

interface ArtistGridProps {
  artists: Artist[];
}

export function ArtistGrid({ artists }: ArtistGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={`/artists/${artist.slug}`}
          className="group"
        >
          <article className="border-3 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-geometric">
            {/* Artist Image */}
            <div className="aspect-square relative overflow-hidden border-b-3 border-black">
              {artist.profile_image_url ? (
                <HalftoneOverlay preset="medium" opacity={0.3}>
                  <Image
                    src={artist.profile_image_url}
                    alt={artist.name}
                    fill
                    className="object-cover"
                  />
                </HalftoneOverlay>
              ) : (
                <div className="w-full h-full bg-grey-200 flex items-center justify-center">
                  <span className="font-anton text-h1 uppercase text-grey-400">
                    {artist.name.charAt(0)}
                  </span>
                </div>
              )}
              
              {/* Verified Badge */}
              {artist.verified && (
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 border-2 border-white">
                  <span className="font-bebas text-body uppercase">
                    VERIFIED
                  </span>
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="p-4">
              <h3 className="font-bebas text-h4 uppercase mb-2 group-hover:text-white">
                {artist.name}
              </h3>
              
              {/* Genre Tags */}
              {artist.genre_tags && artist.genre_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {artist.genre_tags.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="font-share-mono text-meta px-2 py-1 border-2 border-black group-hover:border-white"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio Preview */}
              {artist.bio && (
                <p className="font-share text-body line-clamp-2 text-grey-700 group-hover:text-grey-300">
                  {artist.bio}
                </p>
              )}
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
